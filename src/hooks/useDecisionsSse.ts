import { useCallback, useEffect, useRef, useState } from 'react';

import { StreamEventType } from '@/types/enums';

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
  if (newDecisionsMap.size === prevDecisionsMap.size) {
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
  } else {
    hasChanges = true;
  }

  // If nothing changed, return the same array reference (prevents re-render)
  if (!hasChanges) {
    return prevDecisions;
  }

  // Merge: keep old objects for unchanged decisions, use new objects for changed ones
  return newDecisions.map((newDecision) => {
    const oldDecision = prevDecisionsMap.get(newDecision.id);
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
 * - Pending count tracking
 * - Error handling and reporting
 *
 * @param filters - Filter options for the decisions stream
 * @param onDecisionsUpdate - Callback when decisions are updated
 * @param clearConfirmedUpdates - Optional callback to clear confirmed optimistic updates
 * @param getOptimisticUpdateCount - Optional function to get count of optimistic updates
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
 * } = useDecisionsSse(filters, handleUpdate);
 */
export const useDecisionsSse = (
  filters: FilterOptions,
  onDecisionsUpdate?: (decisions: Decision[]) => void,
  clearConfirmedUpdates?: (decisions: Decision[]) => void,
  getOptimisticUpdateCount?: () => number
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

  /**
   * Build SSE connection URL with filters
   */
  const buildConnectionURL = useCallback((): string => {
    const params = new URLSearchParams({
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page: filters.page.toString(),
      pageSize: filters.pageSize.toString(),
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

  /**
   * Handle SSE message event
   */
  const handleSSEMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as StreamEvent;

        if (data.type === StreamEventType.UPDATE && data.decisions) {
          // Clear confirmed optimistic updates if callback provided
          if (clearConfirmedUpdates) {
            clearConfirmedUpdates(data.decisions);
          }

          // Update decisions with smart merge
          setDecisions((prevDecisions) => {
            const merged = mergeDecisionUpdates(prevDecisions, data.decisions!);

            // Notify parent if decisions actually changed
            if (merged !== prevDecisions && onDecisionsUpdate) {
              onDecisionsUpdate(merged);
            }

            return merged;
          });

          // Update total count if provided
          if (data.totalCount !== undefined) {
            setTotalCount(data.totalCount);
          }

          setIsLoading(false);
        } else if (
          data.type === StreamEventType.PENDING &&
          data.count !== undefined
        ) {
          // Update pending count (unless we have optimistic updates)
          const hasOptimisticUpdates = getOptimisticUpdateCount
            ? getOptimisticUpdateCount() > 0
            : false;

          if (!hasOptimisticUpdates) {
            setPendingCount(data.count);
          }
        } else if (data.type === StreamEventType.ERROR) {
          setError(data.message ?? 'An error occurred');
        }
      } catch (error_) {
        console.error('Error parsing SSE message:', error_);
      }
    },
    [clearConfirmedUpdates, onDecisionsUpdate, getOptimisticUpdateCount]
  );

  /**
   * Handle SSE connection open
   */
  const handleSSEOpen = useCallback(() => {
    setError(null);
    reconnectAttempts.current = 0;
  }, []);

  /**
   * Handle SSE connection error with reconnection logic
   */
  const handleSSEError = useCallback((eventSource: EventSource) => {
    console.error('SSE connection error');
    eventSource.close();

    // Attempt to reconnect with exponential backoff
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

  /**
   * Manually trigger a refresh of the connection
   */
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
