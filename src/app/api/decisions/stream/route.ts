import { type Prisma } from '@prisma/client';
import { type NextRequest } from 'next/server';

import { type DecisionType } from '@/constants/decisions';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { SortField, SortOrder, StreamEventType } from '@/types/enums';

// Force Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';

/**
 * Server-Sent Events endpoint for real-time decision updates
 * Smart polling: Adjusts polling frequency based on pending decision count
 * - Idle (0 pending): 10s interval
 * - Normal (1-5 pending): 3s interval
 * - Busy (>5 pending): 2s interval
 * Supports sorting and filtering via query parameters
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = user.id;

  // Get sorting and filtering parameters from query string
  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get('sortBy') ?? SortField.CREATED_AT;
  const sortOrder = searchParams.get('sortOrder') ?? SortOrder.DESC;
  // Support both old 'categories' and new 'decisionTypes' parameter names
  const decisionTypes =
    searchParams.getAll('decisionTypes').length > 0
      ? searchParams.getAll('decisionTypes')
      : searchParams.getAll('categories');
  const biases = searchParams.getAll('biases');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  // Get pagination parameters
  const page = Math.max(
    1,
    Number.parseInt(searchParams.get('page') ?? '1', 10)
  );
  const pageSize = Math.max(
    1,
    Math.min(100, Number.parseInt(searchParams.get('pageSize') ?? '10', 10))
  );

  // Validate sortBy parameter
  // Support both 'category' (old) and 'decisionType' (new) for backwards compatibility
  const validSortFields = [
    SortField.CREATED_AT,
    SortField.UPDATED_AT,
    SortField.STATUS,
    SortField.DECISION_TYPE,
    'category', // Keep for backwards compatibility
  ] as const;
  type ValidSortField = (typeof validSortFields)[number];
  let sortField: SortField = SortField.CREATED_AT;

  if (validSortFields.includes(sortBy as ValidSortField)) {
    // Map old 'category' to new 'decisionType'
    sortField =
      sortBy === 'category' ? SortField.DECISION_TYPE : (sortBy as SortField);
  }

  // Validate sortOrder parameter
  const order: SortOrder =
    (sortOrder as SortOrder) === SortOrder.ASC ||
    (sortOrder as SortOrder) === SortOrder.DESC
      ? (sortOrder as SortOrder)
      : SortOrder.DESC;

  // Create a readable stream for SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Track if controller is closed to prevent enqueueing after close
      let isClosed = false;

      // Function to send data to client
      const sendEvent = (data: unknown) => {
        if (isClosed) return;
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          // Controller might be closed, mark as closed and stop sending
          isClosed = true;
          console.error('Error sending event:', error);
        }
      };

      // Smart polling: Track and adjust interval based on pending count
      let pollInterval = 3000; // Start with 3s
      let intervalId: NodeJS.Timeout | null = null;

      // Function to check for pending decisions and trigger analysis
      const checkPendingDecisions = async () => {
        try {
          // Get all decisions that need analysis
          const pendingDecisions = await prisma.decision.findMany({
            where: {
              userId,
              status: {
                in: ['PENDING', 'PROCESSING'],
              },
            },
            select: {
              id: true,
              status: true,
              updatedAt: true,
            },
          });

          // Always send pending count to keep client in sync
          sendEvent({
            type: StreamEventType.PENDING,
            count: pendingDecisions.length,
            decisions: pendingDecisions,
          });

          // Adjust polling frequency based on pending count
          let newPollInterval: number;
          if (pendingDecisions.length === 0) {
            newPollInterval = 10_000; // Slow down to 10s when idle
          } else if (pendingDecisions.length > 5) {
            newPollInterval = 2000; // Speed up to 2s when busy
          } else {
            newPollInterval = 3000; // Normal 3s
          }

          // If interval changed, restart with new frequency
          if (newPollInterval !== pollInterval) {
            pollInterval = newPollInterval;
            if (intervalId) {
              clearInterval(intervalId);
            }
            intervalId = setInterval(() => {
              void checkPendingDecisions();
            }, pollInterval);
          }

          // Build where clause with filters
          const whereClause: Prisma.DecisionWhereInput = {
            userId,
          };

          // Add decision type filter
          if (decisionTypes.length > 0) {
            whereClause.decisionType = {
              in: decisionTypes as DecisionType[],
            };
          }

          // Add bias filter - check if decision has any of the selected biases
          if (biases.length > 0) {
            whereClause.biases = {
              hasSome: biases,
            };
          }

          // Add date filters
          if (dateFrom || dateTo) {
            whereClause.createdAt = {};
            if (dateFrom) {
              whereClause.createdAt.gte = new Date(dateFrom);
            }
            if (dateTo) {
              // Add one day to include the entire end date
              const endDate = new Date(dateTo);
              endDate.setDate(endDate.getDate() + 1);
              whereClause.createdAt.lt = endDate;
            }
          }

          // Get total count for pagination
          const totalCount = await prisma.decision.count({
            where: whereClause,
          });

          // Calculate pagination
          const skip = (page - 1) * pageSize;
          const take = pageSize;

          // Get paginated user decisions
          const allDecisions = await prisma.decision.findMany({
            where: whereClause,
            orderBy: {
              [sortField]: order,
            } as Prisma.DecisionOrderByWithRelationInput,
            skip,
            take,
            select: {
              id: true,
              situation: true,
              decision: true,
              reasoning: true,
              status: true,
              decisionType: true,
              biases: true,
              alternatives: true,
              insights: true,
              analysisAttempts: true,
              lastAnalyzedAt: true,
              errorMessage: true,
              isNew: true,
              createdAt: true,
              updatedAt: true,
            },
          });

          sendEvent({
            type: StreamEventType.UPDATE,
            decisions: allDecisions,
            totalCount,
            page,
            pageSize,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error checking pending decisions:', error);
          sendEvent({
            type: StreamEventType.ERROR,
            message: 'Failed to fetch decisions',
          });
        }
      };

      // Initial check
      await checkPendingDecisions();

      // Set up initial interval (will be dynamically adjusted based on load)
      intervalId = setInterval(() => {
        void checkPendingDecisions();
      }, pollInterval);

      // Send keepalive every 30 seconds to prevent connection timeout
      const keepaliveId = setInterval(() => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch (error) {
          isClosed = true;
          console.error('Error sending keepalive:', error);
        }
      }, 30_000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        isClosed = true;
        if (intervalId) {
          clearInterval(intervalId);
        }
        clearInterval(keepaliveId);
        try {
          controller.close();
        } catch (error) {
          // Controller might already be closed
          console.error('Error closing controller:', error);
        }
      });
    },
  });

  // Return SSE response with proper headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
