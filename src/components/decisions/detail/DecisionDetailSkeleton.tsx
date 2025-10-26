'use client';

import { Box, Skeleton, SkeletonText, VStack } from '@chakra-ui/react';

/**
 * Skeleton loader for the decision detail view.
 * Displays placeholder content while decision data is loading.
 */
export const DecisionDetailSkeleton = () => (
  <VStack gap={4} align="stretch">
    {/* Situation skeleton */}
    <Box>
      <Skeleton height="16px" width="80px" mb={3} />
      <SkeletonText noOfLines={3} gap={2} />
    </Box>

    {/* Decision skeleton */}
    <Box>
      <Skeleton height="16px" width="80px" mb={3} />
      <SkeletonText noOfLines={2} gap={2} />
    </Box>

    {/* Reasoning skeleton */}
    <Box>
      <Skeleton height="16px" width="80px" mb={3} />
      <SkeletonText noOfLines={2} gap={2} />
    </Box>

    {/* Created date skeleton */}
    <Box>
      <Skeleton height="16px" width="80px" mb={3} />
      <Skeleton height="20px" width="200px" />
    </Box>
  </VStack>
);

DecisionDetailSkeleton.displayName = 'DecisionDetailSkeleton';
