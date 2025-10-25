'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

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
  analysisAttempts: number;
  lastAnalyzedAt: Date | null;
  errorMessage: string | null;
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

interface FilterOptions {
  sortBy: 'createdAt' | 'updatedAt' | 'status' | 'category';
  sortOrder: 'asc' | 'desc';
  categories: string[];
  biases: string[];
  dateFrom: string | null;
  dateTo: string | null;
}

interface DecisionsContextValue {
  decisions: Decision[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  pendingCount: number;
  filters: FilterOptions;
  setFilters: (filters: Partial<FilterOptions>) => void;
  refresh: () => void;
  optimisticUpdateStatus: (decisionId: string, status: string) => void;
  optimisticDelete: (decisionId: string) => void;
  getDecision: (decisionId: string) => Decision | undefined;
}

const DecisionsContext = createContext<DecisionsContextValue | null>(null);

/**
 * Helper function to check if a decision has changed
 * Compares key fields that matter for UI updates
 */
function hasDecisionChanged(
  oldDecision: Decision,
  newDecision: Decision
): boolean {
  // Compare key fields that affect UI
  return (
    oldDecision.status !== newDecision.status ||
    oldDecision.category !== newDecision.category ||
    oldDecision.analysisAttempts !== newDecision.analysisAttempts ||
    oldDecision.errorMessage !== newDecision.errorMessage ||
    oldDecision.biases.length !== newDecision.biases.length ||
    oldDecision.biases.some((bias, i) => bias !== newDecision.biases[i]) ||
    // Compare dates as strings to handle Date vs string comparison
    new Date(oldDecision.updatedAt).getTime() !==
      new Date(newDecision.updatedAt).getTime() ||
    !!(
      oldDecision.lastAnalyzedAt &&
      newDecision.lastAnalyzedAt &&
      new Date(oldDecision.lastAnalyzedAt).getTime() !==
        new Date(newDecision.lastAnalyzedAt).getTime()
    )
  );
}

export function useDecisions() {
  const context = useContext(DecisionsContext);
  if (!context) {
    throw new Error('useDecisions must be used within DecisionsProvider');
  }
  return context;
}

interface DecisionsProviderProps {
  children: React.ReactNode;
}

export function DecisionsProvider({ children }: DecisionsProviderProps) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFiltersState] = useState<FilterOptions>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    categories: [],
    biases: [],
    dateFrom: null,
    dateTo: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const previousDecisionsRef = useRef<Map<string, string>>(new Map());
  const optimisticUpdatesRef = useRef<Map<string, Partial<Decision>>>(
    new Map()
  );

  const setFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    reconnectAttempts.current = 0;
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Optimistic update for immediate UI feedback
  const optimisticUpdateStatus = useCallback(
    (decisionId: string, status: string) => {
      optimisticUpdatesRef.current.set(decisionId, { status });

      // Immediately update local state
      setDecisions((prev) =>
        prev.map((d) => (d.id === decisionId ? { ...d, status } : d))
      );

      // Update pending count optimistically
      if (status === 'PROCESSING' || status === 'PENDING') {
        setPendingCount((prev) => prev + 1);
      }
    },
    []
  );

  const optimisticDelete = useCallback(
    (decisionId: string) => {
      // Immediately remove from local state
      setDecisions((prev) => prev.filter((d) => d.id !== decisionId));

      // Update pending count if necessary
      const decision = decisions.find((d) => d.id === decisionId);
      if (
        decision &&
        (decision.status === 'PROCESSING' || decision.status === 'PENDING')
      ) {
        setPendingCount((prev) => Math.max(0, prev - 1));
      }
    },
    [decisions]
  );

  const getDecision = useCallback(
    (decisionId: string) => {
      return decisions.find((d) => d.id === decisionId);
    },
    [decisions]
  );

  useEffect(() => {
    const connect = () => {
      try {
        // Close existing connection if any
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // Create new EventSource connection with filters
        const params = new URLSearchParams({
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        });

        // Add category filters
        if (filters.categories.length > 0) {
          filters.categories.forEach((cat) => params.append('categories', cat));
        }

        // Add bias filters
        if (filters.biases.length > 0) {
          filters.biases.forEach((bias) => params.append('biases', bias));
        }

        // Add date filters
        if (filters.dateFrom) {
          params.append('dateFrom', filters.dateFrom);
        }
        if (filters.dateTo) {
          params.append('dateTo', filters.dateTo);
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

                // Only show notification if status actually changed (not optimistic update)
                if (
                  previousStatus &&
                  previousStatus !== decision.status &&
                  !optimisticUpdatesRef.current.has(decision.id)
                ) {
                  // Status changed from PENDING/PROCESSING to COMPLETED
                  if (
                    (previousStatus === 'PENDING' ||
                      previousStatus === 'PROCESSING') &&
                    decision.status === 'COMPLETED'
                  ) {
                    toaster.create({
                      title: 'Analysis Complete',
                      description:
                        'Your decision has been analyzed successfully!',
                      type: 'success',
                      duration: 5000,
                    });
                  }

                  // Status changed to FAILED
                  if (
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
                }

                // Update previous status map
                previousDecisionsRef.current.set(decision.id, decision.status);
              });

              // Clear optimistic updates that have been confirmed
              data.decisions.forEach((decision) => {
                const optimistic = optimisticUpdatesRef.current.get(
                  decision.id
                );
                if (optimistic && optimistic.status === decision.status) {
                  optimisticUpdatesRef.current.delete(decision.id);
                }
              });

              // Smart update: only update decisions that have actually changed
              setDecisions((prevDecisions) => {
                const newDecisionsMap = new Map(
                  data.decisions!.map((d) => [d.id, d])
                );
                const prevDecisionsMap = new Map(
                  prevDecisions.map((d) => [d.id, d])
                );

                // Check if anything actually changed
                let hasChanges = false;

                // Check for new or removed decisions
                if (newDecisionsMap.size !== prevDecisionsMap.size) {
                  hasChanges = true;
                } else {
                  // Check if any decision data changed
                  for (const [id, newDecision] of newDecisionsMap) {
                    const oldDecision = prevDecisionsMap.get(id);
                    if (
                      !oldDecision ||
                      hasDecisionChanged(oldDecision, newDecision)
                    ) {
                      hasChanges = true;
                      break;
                    }
                  }
                }

                // If nothing changed, return the same array reference (prevents re-render)
                if (!hasChanges) {
                  return prevDecisions;
                }

                // Merge: keep old objects for unchanged decisions, use new objects for changed ones
                return data.decisions!.map((newDecision) => {
                  const oldDecision = prevDecisionsMap.get(newDecision.id);
                  if (
                    oldDecision &&
                    !hasDecisionChanged(oldDecision, newDecision)
                  ) {
                    // Decision hasn't changed, return old reference (prevents re-render)
                    return oldDecision;
                  }
                  // Decision is new or changed, use new reference
                  return newDecision;
                });
              });

              setIsLoading(false);
            } else if (data.type === 'pending' && data.count !== undefined) {
              // Update pending count (unless we have optimistic updates)
              if (optimisticUpdatesRef.current.size === 0) {
                setPendingCount(data.count);
              }
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

    // Cleanup on unmount or when filters change
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [
    filters.sortBy,
    filters.sortOrder,
    filters.categories,
    filters.biases,
    filters.dateFrom,
    filters.dateTo,
    refreshTrigger,
  ]);

  const value: DecisionsContextValue = {
    decisions,
    isConnected,
    isLoading,
    error,
    pendingCount,
    filters,
    setFilters,
    refresh,
    optimisticUpdateStatus,
    optimisticDelete,
    getDecision,
  };

  return (
    <DecisionsContext.Provider value={value}>
      {children}
    </DecisionsContext.Provider>
  );
}
