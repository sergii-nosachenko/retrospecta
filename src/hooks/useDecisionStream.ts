import { useEffect, useRef, useState } from 'react';

import { toaster } from '@/components/ui/toaster';

interface Decision {
  id: string;
  situation: string;
  decision: string;
  reasoning: string | null;
  status: string;
  category: string | null;
  biases: string[];
  alternatives: string | null;
  insights: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface StreamEvent {
  type: 'update' | 'pending' | 'error';
  decisions?: Decision[];
  count?: number;
  message?: string;
  timestamp?: string;
}

interface UseDecisionStreamReturn {
  decisions: Decision[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  pendingCount: number;
}

/**
 * Custom hook to connect to server-sent events for real-time decision updates
 * Server polls database every 10 seconds and pushes updates to client
 * Shows toast notifications when decision status changes
 */
export function useDecisionStream(): UseDecisionStreamReturn {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const previousDecisionsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const connect = () => {
      try {
        // Close existing connection if any
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // Create new EventSource connection
        const eventSource = new EventSource('/api/decisions/stream');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('SSE connection established');
          setIsConnected(true);
          setError(null);
          reconnectAttempts.current = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            const data: StreamEvent = JSON.parse(event.data);

            if (data.type === 'update' && data.decisions) {
              // Check for status changes and show notifications
              data.decisions.forEach((decision) => {
                const previousStatus = previousDecisionsRef.current.get(
                  decision.id
                );

                // If status changed from PENDING/PROCESSING to COMPLETED
                if (
                  previousStatus &&
                  (previousStatus === 'PENDING' ||
                    previousStatus === 'PROCESSING') &&
                  decision.status === 'COMPLETED'
                ) {
                  toaster.create({
                    title: 'Analysis Complete',
                    description: `Your decision has been analyzed successfully!`,
                    type: 'success',
                    duration: 5000,
                  });
                }

                // If status changed to FAILED
                if (
                  previousStatus &&
                  previousStatus !== 'FAILED' &&
                  decision.status === 'FAILED'
                ) {
                  toaster.create({
                    title: 'Analysis Failed',
                    description:
                      'Unable to analyze your decision. Please try again.',
                    type: 'error',
                    duration: 5000,
                  });
                }

                // Update previous status map
                previousDecisionsRef.current.set(decision.id, decision.status);
              });

              // Update decisions list
              setDecisions(data.decisions);
              setIsLoading(false);
            } else if (data.type === 'pending' && data.count !== undefined) {
              // Update pending count
              setPendingCount(data.count);
            } else if (data.type === 'error') {
              setError(data.message || 'An error occurred');
            }
          } catch (err) {
            console.error('Error parsing SSE message:', err);
          }
        };

        eventSource.onerror = (err) => {
          console.error('SSE connection error:', err);
          setIsConnected(false);
          eventSource.close();

          // Attempt to reconnect with exponential backoff
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttempts.current),
              30000
            );
            console.log(
              `Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              connect();
            }, delay);
          } else {
            setError('Connection lost. Please refresh the page.');
          }
        };
      } catch (err) {
        console.error('Error connecting to SSE:', err);
        setError('Failed to establish connection');
      }
    };

    // Initial connection
    connect();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    decisions,
    isConnected,
    isLoading,
    error,
    pendingCount,
  };
}
