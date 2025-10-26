import { reanalyzeDecision } from '@/actions/analysis';
import { deleteDecision } from '@/actions/decisions';
import { toaster } from '@/components/ui/toaster';
import { type TFunction } from '@/translations';
import { ProcessingStatus } from '@/types/enums';

interface DecisionActionsContext {
  optimisticUpdateStatus: (id: string, status: ProcessingStatus) => void;
  optimisticDelete: (id: string) => void;
  t: TFunction;
}

/**
 * Core logic for re-analyzing a decision.
 * Can be used by both the useDecisionActions hook and component handlers.
 *
 * @param decisionId - ID of the decision to re-analyze
 * @param context - Context object with optimistic update functions and translations
 * @returns Promise that resolves when the action completes
 */
export async function reanalyzeDecisionAction(
  decisionId: string,
  context: DecisionActionsContext
): Promise<void> {
  const { optimisticUpdateStatus, t } = context;

  try {
    // Optimistically update status immediately for instant UI feedback
    optimisticUpdateStatus(decisionId, ProcessingStatus.PROCESSING);

    const result = await reanalyzeDecision(decisionId);

    if (result.success) {
      // Show brief success notification
      toaster.create({
        title: t('toasts.success.reAnalysisStarted.title'),
        description: t('toasts.success.reAnalysisStarted.description'),
        type: 'info',
        duration: 2000,
      });

      // No need to manually update state - the polling/SSE will automatically
      // pick up changes from the server
    } else {
      // Revert optimistic update on error
      optimisticUpdateStatus(decisionId, ProcessingStatus.COMPLETED);

      toaster.create({
        title: t('toasts.error.title'),
        description: result.error ?? t('toasts.errors.reAnalyze'),
        type: 'error',
        duration: 5000,
      });
    }
  } catch (error) {
    console.error('Error re-analyzing:', error);

    // Revert optimistic update on error
    optimisticUpdateStatus(decisionId, ProcessingStatus.COMPLETED);

    toaster.create({
      title: t('toasts.error.title'),
      description: t('toasts.errors.unexpected'),
      type: 'error',
      duration: 5000,
    });
  }
}

/**
 * Core logic for deleting a decision.
 * Can be used by both the useDecisionActions hook and component handlers.
 *
 * @param decisionId - ID of the decision to delete
 * @param context - Context object with optimistic update functions and translations
 * @param onComplete - Optional callback to run after optimistic delete (e.g., close modal)
 * @returns Promise that resolves when the action completes
 */
export async function deleteDecisionAction(
  decisionId: string,
  context: DecisionActionsContext,
  onComplete?: () => void
): Promise<void> {
  const { optimisticDelete, t } = context;

  try {
    // Optimistically remove decision immediately for instant UI feedback
    optimisticDelete(decisionId);

    // Call onComplete callback (e.g., close modal)
    onComplete?.();

    const result = await deleteDecision(decisionId);

    if (result.success) {
      toaster.create({
        title: t('toasts.success.decisionDeleted.title'),
        description: t('toasts.success.decisionDeleted.description'),
        type: 'success',
        duration: 3000,
      });
    } else {
      toaster.create({
        title: t('toasts.error.title'),
        description: result.error ?? t('toasts.errors.deleteDecision'),
        type: 'error',
        duration: 5000,
      });

      // Note: SSE will restore the decision if deletion failed
    }
  } catch (error) {
    console.error('Error deleting:', error);

    toaster.create({
      title: t('toasts.error.title'),
      description: t('toasts.errors.unexpected'),
      type: 'error',
      duration: 5000,
    });
  }
}
