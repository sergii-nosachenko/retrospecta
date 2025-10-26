'use client';

import { Badge, Stack } from '@chakra-ui/react';
import { memo } from 'react';

import { getBiasLabel } from '@/constants/decisions';
import { useTranslations } from '@/translations';

interface BiasesBadgeListProps {
  biases: string[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  showMoreLabel?: string;
}

/**
 * Reusable component for displaying a list of bias badges.
 * Can optionally limit the number of badges shown and display a "show more" indicator.
 *
 * @param biases - Array of bias identifiers to display
 * @param size - Badge size (default: 'sm')
 * @param maxDisplay - Maximum number of biases to show before truncating (optional)
 * @param showMoreLabel - Custom label for the "show more" badge (optional)
 *
 * @example
 * <BiasesBadgeList biases={['CONFIRMATION', 'ANCHORING']} />
 * <BiasesBadgeList biases={allBiases} maxDisplay={3} />
 */
const BiasesBadgeListComponent = ({
  biases,
  size = 'sm',
  maxDisplay,
  showMoreLabel,
}: BiasesBadgeListProps) => {
  const { t } = useTranslations();

  const displayBiases = maxDisplay ? biases.slice(0, maxDisplay) : biases;
  const remainingCount = maxDisplay ? biases.length - maxDisplay : 0;

  return (
    <Stack direction="row" wrap="wrap" gap={2}>
      {displayBiases.map((bias, index) => (
        <Badge key={index} colorPalette="orange" size={size} px={3} py={1}>
          {getBiasLabel(t, bias)}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge colorPalette="gray" size={size} px={3} py={1}>
          {showMoreLabel ??
            t('decisions.list.actions.showMore', {
              count: remainingCount,
            })}
        </Badge>
      )}
    </Stack>
  );
};

export const BiasesBadgeList = memo(BiasesBadgeListComponent);
BiasesBadgeList.displayName = 'BiasesBadgeList';
