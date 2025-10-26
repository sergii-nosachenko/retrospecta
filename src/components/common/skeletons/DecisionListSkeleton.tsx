'use client';

import { VStack } from '@chakra-ui/react';
import { memo, useMemo } from 'react';

import { DecisionCardSkeleton } from './DecisionCardSkeleton';

interface DecisionListSkeletonProps {
  /**
   * Number of skeleton cards to display
   * @default 3
   */
  count?: number;
}

/**
 * Skeleton loader for the decision list view.
 * Displays multiple DecisionCardSkeleton components in a vertical stack.
 *
 * @example
 * // Default: 3 skeleton cards
 * <DecisionListSkeleton />
 *
 * @example
 * // Custom count
 * <DecisionListSkeleton count={5} />
 */
export const DecisionListSkeleton = memo(
  ({ count = 3 }: DecisionListSkeletonProps) => {
    const skeletonCards = useMemo(
      () =>
        Array.from({ length: count }).map((_, i) => (
          <DecisionCardSkeleton key={i} />
        )),
      [count]
    );

    return (
      <VStack gap={5} align="stretch">
        {skeletonCards}
      </VStack>
    );
  }
);

DecisionListSkeleton.displayName = 'DecisionListSkeleton';
