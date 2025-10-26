'use client';

import { useEffect } from 'react';

import { markDecisionAsRead } from '@/actions/decisions';
import { BaseModal } from '@/components/common';
import { DecisionDetailSkeleton } from '@/components/common/skeletons';
import {
  DecisionAnalysisResults,
  DecisionDetailBody,
  DecisionDetailFooter,
  DecisionDetailHeader,
  DecisionErrorState,
  DecisionProcessingState,
} from '@/components/decisions/detail';
import { useDecisions } from '@/contexts/DecisionsContext';
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
  // Get optimistic update function from context
  const { optimisticMarkAsRead } = useDecisions();

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

  // Mark decision as read when modal opens and decision is new
  useEffect(() => {
    if (open && decision?.isNew) {
      // Optimistically update UI immediately
      optimisticMarkAsRead(decisionId);
      // Update database in background
      void markDecisionAsRead(decisionId);
    }
  }, [open, decision, decisionId, optimisticMarkAsRead]);

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={<DecisionDetailHeader decision={decision} />}
      paddingVariant="compact"
      footer={
        <DecisionDetailFooter
          decision={decision}
          onDelete={handleDeleteWithClose}
          onReanalyze={handleReanalyze}
          isDeleting={isDeleting}
          isReanalyzing={isReanalyzing}
        />
      }
    >
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
    </BaseModal>
  );
};

DecisionDetailModal.displayName = 'DecisionDetailModal';
