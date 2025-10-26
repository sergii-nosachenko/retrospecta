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

  /**
   * Optimistically update a decision's status
   * Provides immediate UI feedback before server confirmation
   */
  const optimisticUpdateStatus = useCallback(
    (
      decisionId: string,
      status: ProcessingStatus,
      decisions: Decision[],
      setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>,
      setPendingCount: React.Dispatch<React.SetStateAction<number>>
    ) => {
      optimisticUpdatesRef.current.set(decisionId, { status });

      // Immediately update local state
      setDecisions((prev) =>
        prev.map((d) => (d.id === decisionId ? { ...d, status } : d))
      );

      // Update pending count optimistically
      if (
        status === ProcessingStatus.PROCESSING ||
        status === ProcessingStatus.PENDING
      ) {
        setPendingCount((prev) => prev + 1);
      }
    },
    []
  );

  /**
   * Optimistically delete a decision
   * Immediately removes from UI before server confirmation
   */
  const optimisticDelete = useCallback(
    (
      decisionId: string,
      decisions: Decision[],
      setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>,
      setPendingCount: React.Dispatch<React.SetStateAction<number>>
    ) => {
      // Immediately remove from local state
      setDecisions((prev) => prev.filter((d) => d.id !== decisionId));

      // Update pending count if necessary
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

  /**
   * Clear optimistic update that has been confirmed by server
   */
  const clearConfirmedUpdate = useCallback((decision: Decision) => {
    const optimistic = optimisticUpdatesRef.current.get(decision.id);
    if (optimistic && optimistic.status === decision.status) {
      optimisticUpdatesRef.current.delete(decision.id);
    }
  }, []);

  /**
   * Clear all confirmed optimistic updates for a batch of decisions
   */
  const clearConfirmedUpdates = useCallback(
    (newDecisions: Decision[]) => {
      newDecisions.forEach((decision) => {
        clearConfirmedUpdate(decision);
      });
    },
    [clearConfirmedUpdate]
  );

  /**
   * Check if a decision has pending optimistic updates
   */
  const hasOptimisticUpdate = useCallback((decisionId: string): boolean => {
    return optimisticUpdatesRef.current.has(decisionId);
  }, []);

  /**
   * Get count of pending optimistic updates
   */
  const getOptimisticUpdateCount = useCallback((): number => {
    return optimisticUpdatesRef.current.size;
  }, []);

  /**
   * Optimistically mark a decision as read (isNew: false)
   * Provides immediate UI feedback before server confirmation
   */
  const optimisticMarkAsRead = useCallback(
    (
      decisionId: string,
      decisions: Decision[],
      setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>
    ) => {
      optimisticUpdatesRef.current.set(decisionId, { isNew: false });

      // Immediately update local state
      setDecisions((prev) =>
        prev.map((d) => (d.id === decisionId ? { ...d, isNew: false } : d))
      );
    },
    []
  );

  return {
    optimisticUpdateStatus,
    optimisticDelete,
    optimisticMarkAsRead,
    clearConfirmedUpdate,
    clearConfirmedUpdates,
    hasOptimisticUpdate,
    getOptimisticUpdateCount,
  };
};
