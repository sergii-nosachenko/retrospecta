'use client';

import { Box, Stack } from '@chakra-ui/react';
import { memo } from 'react';

import { StatusBadge } from '@/components/decisions/shared';
import { useTranslations } from '@/translations';

import type { Decision } from '@/contexts/DecisionsContext';

interface DecisionDetailHeaderProps {
  decision: Decision | null;
}

/**
 * Header component for the decision detail modal.
 * Displays the modal title and current decision status badge.
 *
 * @param decision - The decision object to display the status for
 */
const DecisionDetailHeaderComponent = ({
  decision,
}: DecisionDetailHeaderProps) => {
  const { t } = useTranslations();

  return (
    <Stack direction="row" justify="space-between" align="center" gap={4}>
      <Box fontSize="2xl" fontWeight="bold">
        {t('decisions.detail.title')}
      </Box>
      {decision && <StatusBadge status={decision.status} />}
    </Stack>
  );
};

export const DecisionDetailHeader = memo(DecisionDetailHeaderComponent);
DecisionDetailHeader.displayName = 'DecisionDetailHeader';
