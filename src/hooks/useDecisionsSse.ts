import { useCallback, useEffect, useRef, useState } from 'react';

import { ProcessingStatus, StreamEventType } from '@/types/enums';

import type { FilterOptions } from './useDecisionFilters';
import type { Decision } from '@/types/decision';

/**
 * SSE stream event
 */
interface StreamEvent {
  type: StreamEventType;
  decisions?: Decision[];
  count?: number;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  message?: string;
  timestamp?: string;
}

/**
 * Helper function to check if a decision has changed
 * Compares key fields that matter for UI updates
 */
const hasDecisionChanged = (
  oldDecision: Decision,
  newDecision: Decision
): boolean => {
  return (
    oldDecision.status !== newDecision.status ||
    oldDecision.decisionType !== newDecision.decisionType ||
    oldDecision.analysisAttempts !== newDecision.analysisAttempts ||
    oldDecision.errorMessage !== newDecision.errorMessage ||
    oldDecision.isNew !== newDecision.isNew ||
    oldDecision.isOptimistic !== newDecision.isOptimistic ||
    oldDecision.biases.length !== newDecision.biases.length ||
    oldDecision.biases.some((bias, i) => bias !== newDecision.biases[i]) ||
    new Date(oldDecision.updatedAt).getTime() !==
      new Date(newDecision.updatedAt).getTime() ||
    Boolean(
      oldDecision.lastAnalyzedAt &&
        newDecision.lastAnalyzedAt &&
        new Date(oldDecision.lastAnalyzedAt).getTime() !==
          new Date(newDecision.lastAnalyzedAt).getTime()
    )
  );
};

/**
 * Helper function to merge decision updates
 * Returns the same array reference if nothing changed to prevent re-renders
 * Preserves optimistic updates over stale server data
 */
const mergeDecisionUpdates = (
  prevDecisions: Decision[],
  newDecisions: Decision[],
  hasOptimisticUpdate?: (decisionId: string) => boolean
): Decision[] => {
  const newDecisionsMap = new Map(
    newDecisions.map((decision) => [decision.id, decision])
  );
  const prevDecisionsMap = new Map(
    prevDecisions.map((decision) => [decision.id, decision])
  );

  let hasChanges = false;

  if (newDecisionsMap.size === prevDecisionsMap.size) {
    const orderChanged = newDecisions.some(
      (decision, index) => decision.id !== prevDecisions[index]?.id
    );

    if (orderChanged) {
      hasChanges = true;
    } else {
      for (const [id, newDecision] of newDecisionsMap) {
        const oldDecision = prevDecisionsMap.get(id);
        const hasOptimistic = hasOptimisticUpdate?.(id) ?? false;

        if (
          !hasOptimistic &&
          (!oldDecision || hasDecisionChanged(oldDecision, newDecision))
        ) {
          hasChanges = true;
          break;
        }
      }
    }
  } else {
    hasChanges = true;
  }

  if (!hasChanges) {
    return prevDecisions;
  }

  return newDecisions.map((newDecision) => {
    const oldDecision = prevDecisionsMap.get(newDecision.id);

    // If the old decision was optimistic, preserve the optimistic flag
    // until the decision completes processing (reaches COMPLETED or FAILED status)
    if (oldDecision?.isOptimistic) {
      const isStillProcessing =
        newDecision.status === ProcessingStatus.PENDING ||
        newDecision.status === ProcessingStatus.PROCESSING;

      if (isStillProcessing) {
        // Keep showing optimistic state (with spinner) while processing
        return { ...newDecision, isOptimistic: true };
      }

      // Analysis complete, remove optimistic flag and show final state
      return newDecision;
    }

    if (hasOptimisticUpdate?.(newDecision.id)) {
      return oldDecision ?? newDecision;
    }

    if (oldDecision && !hasDecisionChanged(oldDecision, newDecision)) {
      return oldDecision;
    }

    return newDecision;
  });
};

/**
 * Custom hook for managing SSE connection to decisions stream
 *
 * Establishes and maintains a Server-Sent Events connection for real-time
 * decision updates. Handles reconnection with exponential backoff.
 *
 * Features:
 * - Automatic connection management
 * - Reconnection with exponential backoff
 * - Smart decision merging to prevent unnecessary re-renders
 * - Preserves optimistic updates over stale server data
 * - Pending count tracking
 * - Error handling and reporting
 *
 * @param filters - Filter options for the decisions stream
 * @param onDecisionsUpdate - Callback when decisions are updated
 * @param clearConfirmedUpdates - Optional callback to clear confirmed optimistic updates
 * @param hasOptimisticUpdate - Optional function to check if a decision has an optimistic update
 *
 * @returns SSE connection state and control functions
 *
 * @example
 * const {
 *   decisions,
 *   isLoading,
 *   error,
 *   pendingCount,
 *   refresh
 * } = useDecisionsSse(filters, handleUpdate, clearUpdates, hasOptimistic);
 */
export const useDecisionsSse = (
  filters: FilterOptions,
  onDecisionsUpdate?: (decisions: Decision[]) => void,
  clearConfirmedUpdates?: (decisions: Decision[]) => void,
  hasOptimisticUpdate?: (decisionId: string) => boolean
) => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const buildConnectionURL = useCallback((): string => {
    const params = new URLSearchParams({
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: filters.page.toString(),
      pageSize: filters.pageSize.toString(),
    });

    if (filters.decisionTypes.length > 0) {
      filters.decisionTypes.forEach((type) =>
        params.append('decisionTypes', type)
      );
    }

    if (filters.biases.length > 0) {
      filters.biases.forEach((bias) => params.append('biases', bias));
    }

    if (filters.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params.append('dateTo', filters.dateTo);
    }

    return `/api/decisions/stream?${params.toString()}`;
  }, [filters]);

  const handleSSEMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as StreamEvent;

        if (data.type === StreamEventType.UPDATE && data.decisions) {
          if (clearConfirmedUpdates) {
            clearConfirmedUpdates(data.decisions);
          }

          setDecisions((prevDecisions) => {
            const merged = mergeDecisionUpdates(
              prevDecisions,
              data.decisions ?? [],
              hasOptimisticUpdate
            );

            if (merged !== prevDecisions && onDecisionsUpdate) {
              onDecisionsUpdate(merged);
            }

            return merged;
          });

          if (data.totalCount !== undefined) {
            setTotalCount(data.totalCount);
          }

          setIsLoading(false);
        } else if (data.type === StreamEventType.PENDING) {
          const serverCount = data.count ?? 0;

          setDecisions((currentDecisions) => {
            const hasAnyOptimisticUpdates = currentDecisions.some((decision) =>
              hasOptimisticUpdate?.(decision.id)
            );

            if (hasAnyOptimisticUpdates) {
              const localPendingCount = currentDecisions.filter(
                (decision) =>
                  decision.status === ProcessingStatus.PROCESSING ||
                  decision.status === ProcessingStatus.PENDING
              ).length;
              setPendingCount(localPendingCount);
              return currentDecisions;
            }

            setPendingCount(serverCount);
            return currentDecisions;
          });
        } else if (data.type === StreamEventType.ERROR) {
          setError(data.message ?? 'An error occurred');
        }
      } catch (error_) {
        console.error('Error parsing SSE message:', error_);
      }
    },
    [clearConfirmedUpdates, onDecisionsUpdate, hasOptimisticUpdate]
  );

  const handleSSEOpen = useCallback(() => {
    setError(null);
    reconnectAttempts.current = 0;
  }, []);

  const handleSSEError = useCallback((eventSource: EventSource) => {
    console.error('SSE connection error');
    eventSource.close();

    if (reconnectAttempts.current < maxReconnectAttempts) {
      const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30_000);

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttempts.current++;
        setRefreshTrigger((prev) => prev + 1);
      }, delay);
    } else {
      setError('Connection lost. Please refresh the page.');
    }
  }, []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    reconnectAttempts.current = 0;
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  /**
   * Establish SSE connection
   */
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

        eventSource.addEventListener('open', handleSSEOpen);
        eventSource.addEventListener('message', handleSSEMessage);
        eventSource.addEventListener('error', () => {
          handleSSEError(eventSource);
        });
      } catch (error_) {
        console.error('Error connecting to SSE:', error_);
        setError('Failed to establish connection');
      }
    };

    // Initial connection
    connect();

    // Cleanup on unmount or when filters/refresh change
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

  return {
    decisions,
    setDecisions,
    isLoading,
    error,
    pendingCount,
    setPendingCount,
    totalCount,
    setTotalCount,
    refresh,
  };
};
