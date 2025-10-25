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
  refresh: () => void;
}

interface UseDecisionStreamOptions {
  sortBy?: 'createdAt' | 'updatedAt' | 'status' | 'category';
  sortOrder?: 'asc' | 'desc';
  categories?: string[];
  biases?: string[];
  dateFrom?: string | null;
  dateTo?: string | null;
}

/**
 * Custom hook to connect to server-sent events for real-time decision updates
 * Server polls database every 10 seconds and pushes updates to client
 * Shows toast notifications when decision status changes
 *
 * @param options - Sorting options for decisions
 */
export function useDecisionStream(
  options: UseDecisionStreamOptions = {}
): UseDecisionStreamReturn {
  const {
    sortBy = 'createdAt',
    sortOrder = 'desc',
    categories = [],
    biases = [],
    dateFrom = null,
    dateTo = null,
  } = options;
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const previousDecisionsRef = useRef<Map<string, string>>(new Map());

  const refresh = () => {
    setIsLoading(true);
    setError(null);
    reconnectAttempts.current = 0;
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const connect = () => {
      try {
        // Close existing connection if any
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // Create new EventSource connection with sorting and filtering parameters
        const params = new URLSearchParams({
          sortBy,
          sortOrder,
        });

        // Add category filters
        if (categories.length > 0) {
          categories.forEach((cat) => params.append('categories', cat));
        }

        // Add bias filters
        if (biases.length > 0) {
          biases.forEach((bias) => params.append('biases', bias));
        }

        // Add date filters
        if (dateFrom) {
          params.append('dateFrom', dateFrom);
        }
        if (dateTo) {
          params.append('dateTo', dateTo);
        }

        const url = `/api/decisions/stream?${params.toString()}`;
        const eventSource = new EventSource(url);
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

    // Cleanup on unmount or when sorting/filtering changes
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [sortBy, sortOrder, categories, biases, dateFrom, dateTo, refreshTrigger]);

  return {
    decisions,
    isConnected,
    isLoading,
    error,
    pendingCount,
    refresh,
  };
}
