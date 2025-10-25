import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

/**
 * Server-Sent Events endpoint for real-time decision updates
 * Polls database every 10 seconds for pending decisions
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

          // Get all user decisions to send complete list
          const allDecisions = await prisma.decision.findMany({
            where: {
              userId,
            },
            orderBy: {
              createdAt: 'desc',
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
