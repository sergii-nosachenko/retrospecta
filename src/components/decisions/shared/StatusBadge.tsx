'use client';

import { Badge } from '@chakra-ui/react';
import { memo } from 'react';

import { getStatusLabel } from '@/constants/decisions';
import { getStatusColor } from '@/lib/utils/decision-helpers';
import { useTranslations } from '@/translations';

import type { ProcessingStatus } from '@/types/enums';

interface StatusBadgeProps {
  status: ProcessingStatus;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable badge component for displaying decision status.
 * Automatically applies the correct color palette and translated label.
 *
 * @param status - The processing status to display
 * @param size - Badge size (default: 'lg')
 *
 * @example
 * <StatusBadge status={ProcessingStatus.COMPLETED} />
 */
const StatusBadgeComponent = ({ status, size = 'lg' }: StatusBadgeProps) => {
  const { t } = useTranslations();

  return (
    <Badge colorPalette={getStatusColor(status)} size={size} px={3} py={1}>
      {getStatusLabel(t, status)}
    </Badge>
  );
};

export const StatusBadge = memo(StatusBadgeComponent);
StatusBadge.displayName = 'StatusBadge';
