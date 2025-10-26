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
 */
export const DecisionDetailModal = ({
  decisionId,
  open,
  onOpenChange,
}: DecisionDetailModalProps) => {
  const { optimisticMarkAsRead } = useDecisions();

  const { decision, isLoading } = useDecisionPolling({
    decisionId,
    enabled: open,
    source: 'context',
  });

  const { handleReanalyze, handleDelete, isReanalyzing, isDeleting } =
    useDecisionActions(decision);

  const handleDeleteWithClose = () => {
    void handleDelete(() => onOpenChange(false));
  };

  useEffect(() => {
    if (open && decision?.isNew) {
      optimisticMarkAsRead(decisionId);
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
      {isLoading && <DecisionDetailSkeleton />}
      {!isLoading && decision && (
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
      )}
    </BaseModal>
  );
};

DecisionDetailModal.displayName = 'DecisionDetailModal';
