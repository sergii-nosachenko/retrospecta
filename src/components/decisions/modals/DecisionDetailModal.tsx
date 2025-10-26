'use client';

import {
  DecisionAnalysisResults,
  DecisionDetailBody,
  DecisionDetailFooter,
  DecisionDetailHeader,
  DecisionDetailSkeleton,
  DecisionErrorState,
  DecisionProcessingState,
} from '@/components/decisions/detail';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDecisionActions } from '@/hooks/useDecisionActions';
import { useDecisionPolling } from '@/hooks/useDecisionPolling';
import { ProcessingStatus } from '@/types/enums';

interface DecisionDetailModalProps {
  decisionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal for displaying detailed decision information with real-time updates.
 *
 * Features:
 * - Polls for decision updates while PENDING/PROCESSING
 * - Displays analysis results when COMPLETED
 * - Allows re-analysis and deletion
 *
 * @param decisionId - ID of the decision to display
 * @param open - Whether modal is visible
 * @param onOpenChange - Callback when modal visibility changes
 *
 * @example
 * <DecisionDetailModal
 *   decisionId="abc123"
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 */
export const DecisionDetailModal = ({
  decisionId,
  open,
  onOpenChange,
}: DecisionDetailModalProps) => {
  // Use the polling hook to manage decision state and updates
  const { decision, isLoading } = useDecisionPolling({
    decisionId,
    enabled: open,
    source: 'context', // Use context-based polling (more efficient)
  });

  // Use the actions hook to manage reanalyze and delete actions
  const { handleReanalyze, handleDelete, isReanalyzing, isDeleting } =
    useDecisionActions(decision);

  // Wrap handleDelete to close modal on completion
  const handleDeleteWithClose = () => {
    void handleDelete(() => onOpenChange(false));
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      size={{ base: 'full', sm: 'lg', md: 'xl' }}
      scrollBehavior="inside"
      placement="center"
    >
      <DialogContent
        h={{ base: 'auto', smDown: 'fit-content' }}
        maxH={{ base: '90dvh', smDown: '100dvh' }}
        minH={{ base: 'auto', smDown: '100dvh' }}
      >
        <DialogHeader py={{ base: 3, md: 4 }} px={{ base: 4, md: 6 }}>
          <DialogTitle>
            <DecisionDetailHeader decision={decision} />
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody py={{ base: 3, md: 4 }} px={{ base: 4, md: 6 }}>
          {isLoading ? (
            <DecisionDetailSkeleton />
          ) : decision ? (
            <>
              <DecisionDetailBody decision={decision} />

              {decision.status === ProcessingStatus.COMPLETED && (
                <DecisionAnalysisResults decision={decision} />
              )}

              {(decision.status === ProcessingStatus.PENDING ||
                decision.status === ProcessingStatus.PROCESSING) && (
                <DecisionProcessingState />
              )}

              {decision.status === ProcessingStatus.FAILED && (
                <DecisionErrorState
                  error={decision.errorMessage}
                  onRetry={handleReanalyze}
                  isRetrying={isReanalyzing}
                />
              )}
            </>
          ) : null}
        </DialogBody>

        <DialogFooter
          py={{ base: 3, md: 4 }}
          px={{ base: 4, md: 6 }}
          pb={{ base: 'max(1rem, env(safe-area-inset-bottom))', md: 4 }}
        >
          <DecisionDetailFooter
            decision={decision}
            onDelete={handleDeleteWithClose}
            onReanalyze={handleReanalyze}
            isDeleting={isDeleting}
            isReanalyzing={isReanalyzing}
          />
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

DecisionDetailModal.displayName = 'DecisionDetailModal';
