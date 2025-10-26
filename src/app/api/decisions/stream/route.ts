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
 * Polls database every 3 seconds for pending decisions
 * Supports sorting via query parameters: sortBy and sortOrder
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
      // Function to send data to client
      const sendEvent = (data: unknown) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

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

          // Get all user decisions to send complete list
          const allDecisions = await prisma.decision.findMany({
            where: whereClause,
            orderBy: {
              [sortField]: order,
            } as Prisma.DecisionOrderByWithRelationInput,
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
              createdAt: true,
              updatedAt: true,
            },
          });

          sendEvent({
            type: StreamEventType.UPDATE,
            decisions: allDecisions,
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

      // Set up interval for polling every 3 seconds for faster real-time updates
      const intervalId = setInterval(() => {
        void checkPendingDecisions();
      }, 3000);

      // Send keepalive every 30 seconds to prevent connection timeout
      const keepaliveId = setInterval(() => {
        controller.enqueue(encoder.encode(': keepalive\n\n'));
      }, 30_000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        clearInterval(keepaliveId);
        controller.close();
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
