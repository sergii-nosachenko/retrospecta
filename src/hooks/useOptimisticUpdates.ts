import { useCallback, useRef } from 'react';

import { ProcessingStatus } from '@/types/enums';

import type { Decision } from '@/types/decision';

/**
 * Custom hook for managing optimistic UI updates
 *
 * Provides optimistic update functionality for immediate UI feedback
 * before server confirmation. Tracks pending optimistic updates and
 * manages their lifecycle.
 *
 * Features:
 * - Optimistic status updates
 * - Optimistic delete operations
 * - Tracks which updates are confirmed by server
 * - Manages pending count adjustments
 *
 * @returns Optimistic update functions and state
 *
 * @example
 * const {
 *   optimisticUpdateStatus,
 *   optimisticDelete,
 *   clearConfirmedUpdate,
 *   hasOptimisticUpdate
 * } = useOptimisticUpdates();
 *
 * // Update status optimistically
 * optimisticUpdateStatus(
 *   'decision-id',
 *   ProcessingStatus.PROCESSING,
 *   decisions,
 *   setDecisions,
 *   setPendingCount
 * );
 */
export const useOptimisticUpdates = () => {
  const optimisticUpdatesRef = useRef<Map<string, Partial<Decision>>>(
    new Map()
  );

  const optimisticUpdateStatus = useCallback(
    (
      decisionId: string,
      status: ProcessingStatus,
      decisions: Decision[],
      setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>,
      setPendingCount: React.Dispatch<React.SetStateAction<number>>
    ) => {
      optimisticUpdatesRef.current.set(decisionId, { status });

      const shouldUpdatePendingCountRef = { current: false };

      setDecisions((previousDecisions) => {
        const currentDecision = previousDecisions.find(
          (decision) => decision.id === decisionId
        );

        if (currentDecision?.status === status) {
          return previousDecisions;
        }

        const isMovingToPendingState =
          status === ProcessingStatus.PROCESSING ||
          status === ProcessingStatus.PENDING;

        const wasNotPending =
          currentDecision &&
          currentDecision.status !== ProcessingStatus.PROCESSING &&
          currentDecision.status !== ProcessingStatus.PENDING;

        if (isMovingToPendingState && wasNotPending) {
          shouldUpdatePendingCountRef.current = true;
        }

        return previousDecisions.map((decision) =>
          decision.id === decisionId ? { ...decision, status } : decision
        );
      });

      if (shouldUpdatePendingCountRef.current) {
        setPendingCount((previous) => previous + 1);
      }
    },
    []
  );

  const optimisticDelete = useCallback(
    (
      decisionId: string,
      decisions: Decision[],
      setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>,
      setPendingCount: React.Dispatch<React.SetStateAction<number>>,
      setTotalCount?: React.Dispatch<React.SetStateAction<number>>
    ) => {
      setDecisions((prev) => prev.filter((d) => d.id !== decisionId));

      if (setTotalCount) {
        setTotalCount((prev) => Math.max(0, prev - 1));
      }

      const decision = decisions.find((d) => d.id === decisionId);
      if (
        decision &&
        (decision.status === ProcessingStatus.PROCESSING ||
          decision.status === ProcessingStatus.PENDING)
      ) {
        setPendingCount((prev) => Math.max(0, prev - 1));
      }
    },
    []
  );

  const clearConfirmedUpdate = useCallback((decision: Decision) => {
    const optimistic = optimisticUpdatesRef.current.get(decision.id);
    if (optimistic) {
      if (optimistic.status === decision.status) {
        optimisticUpdatesRef.current.delete(decision.id);
      } else if (
        decision.status !== ProcessingStatus.PENDING &&
        decision.status !== ProcessingStatus.PROCESSING
      ) {
        optimisticUpdatesRef.current.delete(decision.id);
      }
    }
  }, []);

  const clearConfirmedUpdates = useCallback(
    (newDecisions: Decision[]) => {
      newDecisions.forEach((decision) => {
        clearConfirmedUpdate(decision);
      });
    },
    [clearConfirmedUpdate]
  );

  const hasOptimisticUpdate = useCallback((decisionId: string): boolean => {
    return optimisticUpdatesRef.current.has(decisionId);
  }, []);

  const getOptimisticUpdateCount = useCallback((): number => {
    return optimisticUpdatesRef.current.size;
  }, []);

  const optimisticMarkAsRead = useCallback(
    (
      decisionId: string,
      decisions: Decision[],
      setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>
    ) => {
      optimisticUpdatesRef.current.set(decisionId, { isNew: false });

      setDecisions((prev) =>
        prev.map((d) => (d.id === decisionId ? { ...d, isNew: false } : d))
      );
    },
    []
  );

  const optimisticCreate = useCallback(
    (setTotalCount?: React.Dispatch<React.SetStateAction<number>>) => {
      if (setTotalCount) {
        setTotalCount((prev) => prev + 1);
      }
    },
    []
  );

  return {
    optimisticUpdateStatus,
    optimisticDelete,
    optimisticMarkAsRead,
    optimisticCreate,
    clearConfirmedUpdate,
    clearConfirmedUpdates,
    hasOptimisticUpdate,
    getOptimisticUpdateCount,
  };
};
