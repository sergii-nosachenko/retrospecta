import { useCallback, useState } from 'react';

import { useDecisions } from '@/contexts/DecisionsContext';
import {
  deleteDecisionAction,
  reanalyzeDecisionAction,
} from '@/lib/utils/decision-actions';
import { useTranslations } from '@/translations';
import { type ProcessingStatus } from '@/types/enums';

interface Decision {
  id: string;
  status: ProcessingStatus | string;
}

/**
 * Custom hook for managing decision actions (reanalyze, delete).
 *
 * Provides handlers for re-analyzing and deleting decisions with:
 * - Optimistic UI updates for instant feedback
 * - Toast notifications for success/error states
 * - Loading state management
 * - Error handling with automatic rollback
 *
 * @param decision - The decision to perform actions on (can be null)
 * @returns Object containing action handlers and loading states
 *
 * @example
 * const { handleReanalyze, handleDelete, isReanalyzing, isDeleting } =
 *   useDecisionActions(decision);
 *
 * <Button onClick={handleReanalyze} loading={isReanalyzing}>
 *   Re-analyze
 * </Button>
 */
export const useDecisionActions = (decision: Decision | null) => {
  const { t } = useTranslations();
  const { optimisticUpdateStatus, optimisticDelete } = useDecisions();
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Re-analyzes the decision using AI.
   *
   * Flow:
   * 1. Optimistically updates status to PROCESSING
   * 2. Calls server action to trigger analysis
   * 3. Shows success notification or reverts on error
   *
   * The decision will be automatically updated via SSE when analysis completes.
   */
  const handleReanalyze = useCallback(async () => {
    if (!decision) return;

    setIsReanalyzing(true);

    try {
      await reanalyzeDecisionAction(decision.id, {
        optimisticUpdateStatus,
        optimisticDelete,
        t,
      });
    } finally {
      setIsReanalyzing(false);
    }
  }, [decision, optimisticUpdateStatus, optimisticDelete, t]);

  /**
   * Deletes the decision.
   *
   * Flow:
   * 1. Optimistically removes decision from UI
   * 2. Calls server action to delete from database
   * 3. Shows success notification or restores via SSE on error
   *
   * @param onComplete - Optional callback to run after successful deletion (e.g., close modal)
   */
  const handleDelete = useCallback(
    async (onComplete?: () => void) => {
      if (!decision) return;

      setIsDeleting(true);

      try {
        await deleteDecisionAction(
          decision.id,
          {
            optimisticUpdateStatus,
            optimisticDelete,
            t,
          },
          onComplete
        );
      } finally {
        setIsDeleting(false);
      }
    },
    [decision, optimisticUpdateStatus, optimisticDelete, t]
  );

  return {
    handleReanalyze,
    handleDelete,
    isReanalyzing,
    isDeleting,
  };
};
