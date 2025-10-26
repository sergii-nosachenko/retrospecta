'use client';

import { Card, Skeleton, Stack, VStack } from '@chakra-ui/react';
import { memo, useMemo } from 'react';

import { SkeletonSection } from './SkeletonSection';

/**
 * Simple skeleton card for basic loading states
 */
const SimpleSkeletonCard = memo(() => (
  <Card.Root>
    <Card.Body p={6}>
      <Stack gap={4}>
        <Skeleton height="24px" width="100px" />
        <SkeletonSection lines={3} />
      </Stack>
    </Card.Body>
  </Card.Root>
));

SimpleSkeletonCard.displayName = 'SimpleSkeletonCard';

interface SimpleListSkeletonProps {
  /**
   * Number of skeleton cards to display
   * @default 3
   */
  count?: number;
}

/**
 * Simple list skeleton for basic loading states.
 * Shows a header skeleton and simple card skeletons.
 * Used for authentication checking and other simple loading states.
 *
 * @example
 * // Default: 3 skeleton cards
 * <SimpleListSkeleton />
 *
 * @example
 * // Custom count
 * <SimpleListSkeleton count={5} />
 */
export const SimpleListSkeleton = memo(
  ({ count = 3 }: SimpleListSkeletonProps) => {
    const skeletonCards = useMemo(
      () =>
        Array.from({ length: count }).map((_, i) => (
          <SimpleSkeletonCard key={i} />
        )),
      [count]
    );

    return (
      <Stack gap={5} align="stretch">
        <Skeleton height="40px" width="200px" />
        <VStack gap={5} align="stretch">
          {skeletonCards}
        </VStack>
      </Stack>
    );
  }
);

SimpleListSkeleton.displayName = 'SimpleListSkeleton';
