'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  decisionType: string | null;
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
  sortBy: 'createdAt' | 'updatedAt' | 'status' | 'decisionType';
  sortOrder: 'asc' | 'desc';
  decisionTypes: string[];
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
const hasDecisionChanged = (
  oldDecision: Decision,
  newDecision: Decision
): boolean => {
  // Compare key fields that affect UI
  return (
    oldDecision.status !== newDecision.status ||
    oldDecision.decisionType !== newDecision.decisionType ||
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
};

/**
 * Helper function to show status change notifications
 */
const showStatusChangeNotification = (
  previousStatus: string,
  newStatus: string
): void => {
  // Status changed from PENDING/PROCESSING to COMPLETED
  if (
    (previousStatus === 'PENDING' || previousStatus === 'PROCESSING') &&
    newStatus === 'COMPLETED'
  ) {
    toaster.create({
      title: 'Analysis Complete',
      description: 'Your decision has been analyzed successfully!',
      type: 'success',
      duration: 5000,
    });
  }

  // Status changed to FAILED
  if (previousStatus !== 'FAILED' && newStatus === 'FAILED') {
    toaster.create({
      title: 'Analysis Failed',
      description: 'Unable to analyze your decision. Please try again.',
      type: 'error',
      duration: 5000,
    });
  }
};

/**
 * Helper function to merge decision updates
 * Returns the same array reference if nothing changed to prevent re-renders
 */
const mergeDecisionUpdates = (
  prevDecisions: Decision[],
  newDecisions: Decision[]
): Decision[] => {
  const newDecisionsMap = new Map(newDecisions.map((d) => [d.id, d]));
  const prevDecisionsMap = new Map(prevDecisions.map((d) => [d.id, d]));

  // Check if anything actually changed
  let hasChanges = false;

  // Check for new or removed decisions
  if (newDecisionsMap.size !== prevDecisionsMap.size) {
    hasChanges = true;
  } else {
    // Check if the order of decisions changed
    const orderChanged = newDecisions.some(
      (decision, index) => decision.id !== prevDecisions[index]?.id
    );

    if (orderChanged) {
      hasChanges = true;
    } else {
      // Check if any decision data changed
      for (const [id, newDecision] of newDecisionsMap) {
        const oldDecision = prevDecisionsMap.get(id);
        if (!oldDecision || hasDecisionChanged(oldDecision, newDecision)) {
          hasChanges = true;
          break;
        }
      }
    }
  }

  // If nothing changed, return the same array reference (prevents re-render)
  if (!hasChanges) {
    return prevDecisions;
  }

  // Merge: keep old objects for unchanged decisions, use new objects for changed ones
  return newDecisions.map((newDecision) => {
    const oldDecision = prevDecisionsMap.get(newDecision.id);
    if (oldDecision && !hasDecisionChanged(oldDecision, newDecision)) {
      // Decision hasn't changed, return old reference (prevents re-render)
      return oldDecision;
    }
    // Decision is new or changed, use new reference
    return newDecision;
  });
};

export const useDecisions = (): DecisionsContextValue => {
  const context = useContext(DecisionsContext);
  if (!context) {
    throw new Error('useDecisions must be used within DecisionsProvider');
  }
  return context;
};

interface DecisionsProviderProps {
  children: React.ReactNode;
}

export const DecisionsProvider = ({ children }: DecisionsProviderProps) => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFiltersState] = useState<FilterOptions>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    decisionTypes: [],
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

  // Handle status change notifications
  const handleStatusNotifications = useCallback((newDecisions: Decision[]) => {
    newDecisions.forEach((decision) => {
      const previousStatus = previousDecisionsRef.current.get(decision.id);

      // Only show notification if status actually changed (not optimistic update)
      if (
        previousStatus &&
        previousStatus !== decision.status &&
        !optimisticUpdatesRef.current.has(decision.id)
      ) {
        showStatusChangeNotification(previousStatus, decision.status);
      }

      // Update previous status map
      previousDecisionsRef.current.set(decision.id, decision.status);
    });
  }, []);

  // Clear optimistic updates that have been confirmed
  const clearConfirmedOptimisticUpdates = useCallback(
    (newDecisions: Decision[]) => {
      newDecisions.forEach((decision) => {
        const optimistic = optimisticUpdatesRef.current.get(decision.id);
        if (optimistic && optimistic.status === decision.status) {
          optimisticUpdatesRef.current.delete(decision.id);
        }
      });
    },
    []
  );

  // Handle SSE message event
  const handleSSEMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data: StreamEvent = JSON.parse(event.data);

        if (data.type === 'update' && data.decisions) {
          // Handle notifications
          handleStatusNotifications(data.decisions);

          // Clear confirmed optimistic updates
          clearConfirmedOptimisticUpdates(data.decisions);

          // Update decisions with smart merge
          setDecisions((prevDecisions) =>
            mergeDecisionUpdates(prevDecisions, data.decisions!)
          );

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
    },
    [handleStatusNotifications, clearConfirmedOptimisticUpdates]
  );

  // Build SSE connection URL with filters
  const buildConnectionURL = useCallback((): string => {
    const params = new URLSearchParams({
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });

    // Add decision type filters
    if (filters.decisionTypes.length > 0) {
      filters.decisionTypes.forEach((type) =>
        params.append('decisionTypes', type)
      );
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

    return `/api/decisions/stream?${params.toString()}`;
  }, [filters]);

  // Handle SSE connection open
  const handleSSEOpen = useCallback(() => {
    console.log('SSE connection established');
    setIsConnected(true);
    setError(null);
    reconnectAttempts.current = 0;
  }, []);

  // Handle SSE connection error with reconnection logic
  const handleSSEError = useCallback((eventSource: EventSource) => {
    console.error('SSE connection error');
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
        // Trigger reconnection by updating refresh trigger
        setRefreshTrigger((prev) => prev + 1);
      }, delay);
    } else {
      setError('Connection lost. Please refresh the page.');
    }
  }, []);

  // Establish SSE connection
  useEffect(() => {
    const connect = () => {
      try {
        // Close existing connection if any
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // Create new EventSource connection
        const url = buildConnectionURL();
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onopen = handleSSEOpen;
        eventSource.onmessage = handleSSEMessage;
        eventSource.onerror = () => handleSSEError(eventSource);
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
    buildConnectionURL,
    handleSSEOpen,
    handleSSEMessage,
    handleSSEError,
    refreshTrigger,
  ]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<DecisionsContextValue>(
    () => ({
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
    }),
    [
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
    ]
  );

  return (
    <DecisionsContext.Provider value={value}>
      {children}
    </DecisionsContext.Provider>
  );
};

// Add displayName for better debugging
DecisionsProvider.displayName = 'DecisionsProvider';
