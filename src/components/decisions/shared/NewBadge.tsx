'use client';

import { Badge } from '@chakra-ui/react';
import { memo } from 'react';

import { useTranslations } from '@/translations';

interface NewBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge component for displaying NEW indicator on unread decisions.
 *
 * @param size - Badge size (default: 'lg')
 *
 * @example
 * <NewBadge />
 */
const NewBadgeComponent = ({ size = 'lg' }: NewBadgeProps) => {
  const { t } = useTranslations();

  return (
    <Badge colorPalette="red" size={size} px={3} py={1}>
      {t('decisions.list.badge.new')}
    </Badge>
  );
};

export const NewBadge = memo(NewBadgeComponent);
NewBadge.displayName = 'NewBadge';
