'use client';

import { Badge, Box, Stack } from '@chakra-ui/react';
import { memo } from 'react';

import { getStatusLabel } from '@/constants/decisions';
import { useTranslations } from '@/translations';
import { ProcessingStatus } from '@/types/enums';

import type { Decision } from '@/contexts/DecisionsContext';

interface DecisionDetailHeaderProps {
  decision: Decision | null;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case ProcessingStatus.COMPLETED:
      return 'green';
    case ProcessingStatus.PENDING:
      return 'yellow';
    case ProcessingStatus.PROCESSING:
      return 'blue';
    case ProcessingStatus.FAILED:
      return 'red';
    default:
      return 'gray';
  }
};

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
      {decision && (
        <Badge
          colorPalette={getStatusColor(decision.status)}
          size="lg"
          px={3}
          py={1}
        >
          {getStatusLabel(t, decision.status)}
        </Badge>
      )}
    </Stack>
  );
};

export const DecisionDetailHeader = memo(DecisionDetailHeaderComponent);
DecisionDetailHeader.displayName = 'DecisionDetailHeader';
