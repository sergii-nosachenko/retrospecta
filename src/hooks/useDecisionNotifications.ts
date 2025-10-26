import { useCallback, useEffect, useRef } from 'react';

import { toaster } from '@/components/ui/toaster';
import { ProcessingStatus } from '@/types/enums';

import type { Decision } from '@/types/decision';

/**
 * Show notification when decision status changes
 */
const showStatusChangeNotification = (
  previousStatus: ProcessingStatus,
  newStatus: ProcessingStatus
): void => {
  // Status changed from PENDING/PROCESSING to COMPLETED
  if (
    (previousStatus === ProcessingStatus.PENDING ||
      previousStatus === ProcessingStatus.PROCESSING) &&
    newStatus === ProcessingStatus.COMPLETED
  ) {
    toaster.create({
      title: 'Analysis Complete',
      description: 'Your decision has been analyzed successfully!',
      type: 'success',
      duration: 5000,
    });
  }

  // Status changed to FAILED
  if (
    previousStatus !== ProcessingStatus.FAILED &&
    newStatus === ProcessingStatus.FAILED
  ) {
    toaster.create({
      title: 'Analysis Failed',
      description: 'Unable to analyze your decision. Please try again.',
      type: 'error',
      duration: 5000,
    });
  }
};

/**
 * Custom hook for managing decision status change notifications
 *
 * Monitors decision status changes and displays toast notifications
 * when a decision completes analysis or fails.
 *
 * Features:
 * - Tracks previous decision statuses
 * - Shows success notification on completion
 * - Shows error notification on failure
 * - Prevents duplicate notifications for optimistic updates
 *
 * @param decisions - Current list of decisions to monitor
 * @param hasOptimisticUpdate - Function to check if decision has optimistic update
 *
 * @example
 * const decisions = useDecisions();
 * useDecisionNotifications(decisions, hasOptimisticUpdate);
 */
export const useDecisionNotifications = (
  decisions: Decision[],
  hasOptimisticUpdate?: (decisionId: string) => boolean
) => {
  const previousDecisionsRef = useRef<Map<string, ProcessingStatus>>(new Map());

  /**
   * Handle status change notifications for a batch of decisions
   */
  const handleStatusNotifications = useCallback(
    (newDecisions: Decision[]) => {
      newDecisions.forEach((decision) => {
        const previousStatus = previousDecisionsRef.current.get(decision.id);

        // Only show notification if status actually changed (not optimistic update)
        if (
          previousStatus &&
          previousStatus !== decision.status &&
          !hasOptimisticUpdate?.(decision.id)
        ) {
          showStatusChangeNotification(previousStatus, decision.status);
        }

        // Update previous status map
        previousDecisionsRef.current.set(decision.id, decision.status);
      });
    },
    [hasOptimisticUpdate]
  );

  /**
   * Monitor decisions for status changes
   */
  useEffect(() => {
    if (decisions.length > 0) {
      handleStatusNotifications(decisions);
    }
  }, [decisions, handleStatusNotifications]);

  return { handleStatusNotifications };
};
