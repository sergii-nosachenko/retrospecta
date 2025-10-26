'use client';

import { Badge, Stack } from '@chakra-ui/react';
import { memo } from 'react';

import {
  getDecisionTypeIcon,
  getDecisionTypeLabel,
} from '@/constants/decisions';
import { useTranslations } from '@/translations';

interface DecisionTypeBadgeProps {
  decisionType: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable badge component for displaying decision type.
 * Shows an icon and translated label for the decision type.
 *
 * @param decisionType - The type of decision to display
 * @param size - Badge size (default: 'lg')
 *
 * @example
 * <DecisionTypeBadge decisionType="CAREER" />
 */
const DecisionTypeBadgeComponent = ({
  decisionType,
  size = 'lg',
}: DecisionTypeBadgeProps) => {
  const { t } = useTranslations();

  return (
    <Badge
      colorPalette="blue"
      size={size}
      px={size === 'lg' ? 4 : 3}
      py={size === 'lg' ? 2 : 1}
    >
      <Stack direction="row" align="center" gap={1.5}>
        {getDecisionTypeIcon(decisionType)}
        <span>{getDecisionTypeLabel(t, decisionType)}</span>
      </Stack>
    </Badge>
  );
};

export const DecisionTypeBadge = memo(DecisionTypeBadgeComponent);
DecisionTypeBadge.displayName = 'DecisionTypeBadge';
