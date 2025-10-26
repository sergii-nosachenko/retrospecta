import { useCallback, useEffect, useState } from 'react';

import { getDecision } from '@/actions/decisions';
import { useDecisions } from '@/contexts/DecisionsContext';
import { ProcessingStatus } from '@/types/enums';

interface DecisionData {
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
  decision: DecisionData | null;
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
  const [decision, setDecision] = useState<DecisionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);

  /**
   * Check if a status is terminal (no more updates expected)
   */
  const isTerminalStatus = useCallback((status: string): boolean => {
    return (
      status === ProcessingStatus.COMPLETED ||
      status === ProcessingStatus.FAILED
    );
  }, []);

  /**
   * Fetch decision from context or API
   */
  const fetchDecision = useCallback(async () => {
    if (!decisionId) return;

    setIsLoading(true);

    if (source === 'context') {
      // Get decision from context (instant, no API call needed!)
      const contextDecision = getDecisionFromContext(decisionId);

      if (contextDecision) {
        // Context has all the fields we need
        const decisionData: DecisionData = {
          ...contextDecision,
          analysisAttempts: contextDecision.analysisAttempts ?? 0,
          lastAnalyzedAt: contextDecision.lastAnalyzedAt ?? null,
          errorMessage: contextDecision.errorMessage ?? null,
        };

        setDecision(decisionData);

        // Start polling if status is PENDING or PROCESSING
        if (!isTerminalStatus(contextDecision.status)) {
          setIsPolling(true);
        }
      } else {
        // Fallback: decision not in context yet (shouldn't happen normally)
        const result = await getDecision(decisionId);

        if (result.success && result.data) {
          setDecision(result.data);

          // Start polling if status is PENDING or PROCESSING
          if (!isTerminalStatus(result.data.status)) {
            setIsPolling(true);
          }
        }
      }
    } else {
      // API-based polling (less efficient)
      const result = await getDecision(decisionId);

      if (result.success && result.data) {
        setDecision(result.data);

        // Start polling if status is PENDING or PROCESSING
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
        // Get updated decision from context (no API call)
        const updatedDecision = getDecisionFromContext(decision.id);

        if (updatedDecision) {
          // Update local state with context data
          setDecision((prev) => ({
            ...prev!,
            ...updatedDecision,
            analysisAttempts: updatedDecision.analysisAttempts ?? 0,
            lastAnalyzedAt: updatedDecision.lastAnalyzedAt ?? null,
            errorMessage: updatedDecision.errorMessage ?? null,
          }));

          // Stop polling if analysis is complete or failed
          if (isTerminalStatus(updatedDecision.status)) {
            setIsPolling(false);

            // Fetch full details one last time to get error message if failed
            if (updatedDecision.status === ProcessingStatus.FAILED) {
              void getDecision(decision.id).then((result) => {
                if (result.success && result.data) {
                  setDecision(result.data);
                }
              });
            }
          }
        }
      } else {
        // API-based polling
        void getDecision(decision.id).then((result) => {
          if (result.success && result.data) {
            setDecision(result.data);

            // Stop polling if analysis is complete or failed
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

  /**
   * Manual refetch function
   */
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
