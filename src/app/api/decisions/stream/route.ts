import { Prisma } from '@prisma/client';

import { NextRequest } from 'next/server';

import { DecisionCategory } from '@/components/decisions/CategoryFilter';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * Server-Sent Events endpoint for real-time decision updates
 * Polls database every 10 seconds for pending decisions
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
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const categories = searchParams.getAll('categories');
  const biases = searchParams.getAll('biases');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  // Validate sortBy parameter
  const validSortFields = ['createdAt', 'updatedAt', 'status', 'category'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

  // Validate sortOrder parameter
  const validSortOrders = ['asc', 'desc'];
  const order = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';

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

          // If there are pending decisions, send update to client
          if (pendingDecisions.length > 0) {
            sendEvent({
              type: 'pending',
              count: pendingDecisions.length,
              decisions: pendingDecisions,
            });
          }

          // Build where clause with filters
          const whereClause: Prisma.DecisionWhereInput = {
            userId,
          };

          // Add category filter
          if (categories.length > 0) {
            whereClause.category = {
              in: categories as DecisionCategory[],
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
            },
            select: {
              id: true,
              situation: true,
              decision: true,
              reasoning: true,
              status: true,
              category: true,
              biases: true,
              alternatives: true,
              insights: true,
              createdAt: true,
              updatedAt: true,
            },
          });

          sendEvent({
            type: 'update',
            decisions: allDecisions,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error checking pending decisions:', error);
          sendEvent({
            type: 'error',
            message: 'Failed to fetch decisions',
          });
        }
      };

      // Initial check
      await checkPendingDecisions();

      // Set up interval for polling every 10 seconds
      const intervalId = setInterval(checkPendingDecisions, 10000);

      // Send keepalive every 30 seconds to prevent connection timeout
      const keepaliveId = setInterval(() => {
        controller.enqueue(encoder.encode(': keepalive\n\n'));
      }, 30000);

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
