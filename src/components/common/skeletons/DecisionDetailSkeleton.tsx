'use client';

import { Skeleton, VStack } from '@chakra-ui/react';

import { SkeletonSection } from '@/components/common/skeletons/SkeletonSection';

/**
 * Skeleton loader for the decision detail view.
 * Displays placeholder content while decision data is loading.
 */
export const DecisionDetailSkeleton = () => (
  <VStack gap={4} align="stretch">
    {/* Situation skeleton */}
    <SkeletonSection label lines={3} />

    {/* Decision skeleton */}
    <SkeletonSection label lines={2} />

    {/* Reasoning skeleton */}
    <SkeletonSection label lines={2} />

    {/* Created date skeleton */}
    <SkeletonSection label>
      <Skeleton height="20px" width="200px" />
    </SkeletonSection>
  </VStack>
);

DecisionDetailSkeleton.displayName = 'DecisionDetailSkeleton';
