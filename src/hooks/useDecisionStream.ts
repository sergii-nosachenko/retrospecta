import { useEffect, useRef, useState } from 'react';

import { toaster } from '@/components/ui/toaster';
import {
  ProcessingStatus,
  SortField,
  SortOrder,
  StreamEventType,
} from '@/types/enums';

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
  type: StreamEventType;
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
  sortBy?: SortField;
  sortOrder?: SortOrder;
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
    sortBy = SortField.CREATED_AT,
    sortOrder = SortOrder.DESC,
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

        eventSource.addEventListener('open', () => {
          setIsConnected(true);
          setError(null);
          reconnectAttempts.current = 0;
        });

        eventSource.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data as string) as StreamEvent;

            if (data.type === StreamEventType.UPDATE && data.decisions) {
              // Check for status changes and show notifications
              data.decisions.forEach((decision) => {
                const previousStatus = previousDecisionsRef.current.get(
                  decision.id
                );

                // If status changed from PENDING/PROCESSING to COMPLETED
                if (
                  previousStatus &&
                  (previousStatus === ProcessingStatus.PENDING ||
                    previousStatus === ProcessingStatus.PROCESSING) &&
                  decision.status === ProcessingStatus.COMPLETED
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
                  previousStatus !== ProcessingStatus.FAILED &&
                  decision.status === ProcessingStatus.FAILED
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
            } else if (
              data.type === StreamEventType.PENDING &&
              data.count !== undefined
            ) {
              // Update pending count
              setPendingCount(data.count);
            } else if (data.type === StreamEventType.ERROR) {
              setError(data.message ?? 'An error occurred');
            }
          } catch (error_) {
            console.error('Error parsing SSE message:', error_);
          }
        });

        eventSource.addEventListener('error', (err) => {
          console.error('SSE connection error:', err);
          setIsConnected(false);
          eventSource.close();

          // Attempt to reconnect with exponential backoff
          if (reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.min(
              1000 * 2 ** reconnectAttempts.current,
              30_000
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              connect();
            }, delay);
          } else {
            setError('Connection lost. Please refresh the page.');
          }
        });
      } catch (error_) {
        console.error('Error connecting to SSE:', error_);
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
