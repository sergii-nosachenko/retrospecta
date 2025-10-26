'use client';

import { Button, Stack } from '@chakra-ui/react';
import { memo } from 'react';

import { useTranslations } from '@/translations';
import { ProcessingStatus } from '@/types/enums';

import type { Decision } from '@/contexts/DecisionsContext';

interface DecisionDetailFooterProps {
  decision: Decision | null;
  onDelete: () => void;
  onReanalyze: () => void;
  isDeleting: boolean;
  isReanalyzing: boolean;
}

/**
 * Footer component for the decision detail modal.
 * Displays delete and reanalyze action buttons.
 *
 * @param decision - The decision object
 * @param onDelete - Callback for delete action
 * @param onReanalyze - Callback for reanalyze action
 * @param isDeleting - Whether deletion is in progress
 * @param isReanalyzing - Whether reanalysis is in progress
 */
const DecisionDetailFooterComponent = ({
  decision,
  onDelete,
  onReanalyze,
  isDeleting,
  isReanalyzing,
}: DecisionDetailFooterProps) => {
  const { t } = useTranslations();

  return (
    <Stack direction="row" justify="space-between" align="center" width="100%">
      <Button
        colorPalette="red"
        variant="ghost"
        onClick={onDelete}
        loading={isDeleting}
        loadingText={t('common.actions.delete')}
        size="lg"
        px={6}
      >
        {t('common.actions.delete')}
      </Button>
      {decision?.status === ProcessingStatus.COMPLETED && (
        <Button
          colorPalette="blue"
          variant="outline"
          onClick={onReanalyze}
          loading={isReanalyzing}
          loadingText={t('decisions.list.actions.reAnalyze')}
          size="lg"
          px={6}
        >
          {t('decisions.list.actions.reAnalyze')}
        </Button>
      )}
    </Stack>
  );
};

export const DecisionDetailFooter = memo(DecisionDetailFooterComponent);
DecisionDetailFooter.displayName = 'DecisionDetailFooter';
