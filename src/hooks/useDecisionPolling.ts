import { useCallback, useEffect, useState } from 'react';

import { getDecision } from '@/actions/decisions';
import { type Decision, useDecisions } from '@/contexts/DecisionsContext';
import { ProcessingStatus } from '@/types/enums';

interface UseDecisionPollingOptions {
  decisionId: string;
  enabled: boolean;
  /**
   * Polling interval in milliseconds
   * @default 1000 (1 second)
   */
  interval?: number;
  /**
   * Whether to fetch from context or make API calls
   * @default 'context' - More efficient, uses SSE updates
   */
  source?: 'context' | 'api';
}

interface UseDecisionPollingReturn {
  decision: Decision | null;
  isLoading: boolean;
  isPolling: boolean;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for polling decision updates
 *
 * This hook provides real-time updates for decisions by polling either:
 * - Context (SSE-backed, efficient, recommended) - polls every 1 second
 * - API (direct calls, less efficient) - polls every 3 seconds
 *
 * Automatically stops polling when decision reaches a terminal status (COMPLETED or FAILED)
 *
 * @param options - Configuration options
 * @returns Decision data, loading state, polling state, and refetch function
 *
 * @example
 * ```tsx
 * const { decision, isPolling, isLoading } = useDecisionPolling({
 *   decisionId: '123',
 *   enabled: true,
 * });
 * ```
 */
export const useDecisionPolling = ({
  decisionId,
  enabled,
  interval = 1000,
  source = 'context',
}: UseDecisionPollingOptions): UseDecisionPollingReturn => {
  const { getDecision: getDecisionFromContext } = useDecisions();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);

  const isTerminalStatus = useCallback((status: string): boolean => {
    return (
      status === ProcessingStatus.COMPLETED ||
      status === ProcessingStatus.FAILED
    );
  }, []);

  const fetchDecision = useCallback(async () => {
    if (!decisionId) return;

    setIsLoading(true);

    if (source === 'context') {
      const contextDecision = getDecisionFromContext(decisionId);

      if (contextDecision) {
        setDecision(contextDecision);

        if (!isTerminalStatus(contextDecision.status)) {
          setIsPolling(true);
        }
      } else {
        const result = await getDecision(decisionId);

        if (result.success && result.data) {
          setDecision(result.data as Decision);

          if (!isTerminalStatus(result.data.status)) {
            setIsPolling(true);
          }
        }
      }
    } else {
      const result = await getDecision(decisionId);

      if (result.success && result.data) {
        setDecision(result.data as Decision);

        if (!isTerminalStatus(result.data.status)) {
          setIsPolling(true);
        }
      }
    }

    setIsLoading(false);
  }, [decisionId, source, getDecisionFromContext, isTerminalStatus]);

  /**
   * Initial fetch when enabled or decisionId changes
   * Note: This is intentional data fetching in an effect - a legitimate pattern for syncing
   * with external data sources when the component mounts or dependencies change.
   */
  useEffect(() => {
    if (enabled && decisionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchDecision();
    }
  }, [enabled, decisionId, fetchDecision]);

  /**
   * Poll for updates when enabled
   * Uses context data (updated by SSE) instead of making API calls
   */
  useEffect(() => {
    if (!isPolling || !enabled || !decision) return;

    const intervalId = setInterval(() => {
      if (source === 'context') {
        const updatedDecision = getDecisionFromContext(decision.id);

        if (updatedDecision) {
          setDecision(updatedDecision);

          if (isTerminalStatus(updatedDecision.status)) {
            setIsPolling(false);

            if (updatedDecision.status === ProcessingStatus.FAILED) {
              void getDecision(decision.id).then((result) => {
                if (result.success && result.data) {
                  setDecision(result.data as Decision);
                }
              });
            }
          }
        }
      } else {
        void getDecision(decision.id).then((result) => {
          if (result.success && result.data) {
            setDecision(result.data as Decision);

            if (isTerminalStatus(result.data.status)) {
              setIsPolling(false);
            }
          }
        });
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [
    decision,
    isPolling,
    enabled,
    source,
    interval,
    getDecisionFromContext,
    isTerminalStatus,
  ]);

  const refetch = useCallback(async () => {
    await fetchDecision();
  }, [fetchDecision]);

  return {
    decision,
    isLoading,
    isPolling,
    refetch,
  };
};
