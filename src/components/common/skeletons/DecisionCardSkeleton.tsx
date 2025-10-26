'use client';

import { Box, Card, Skeleton, Stack } from '@chakra-ui/react';

import { SkeletonSection } from './SkeletonSection';

/**
 * Skeleton loader for decision cards in the list view.
 * Mimics the structure of a DecisionCard component.
 */
export const DecisionCardSkeleton = () => (
  <Card.Root>
    <Card.Body p={6}>
      <Stack gap={4}>
        {/* Header: Status badge, date, and menu */}
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="row" align="center" gap={2}>
            <Skeleton height="28px" width="80px" borderRadius="md" />
            <Skeleton height="16px" width="100px" />
          </Stack>
          <Skeleton height="32px" width="32px" borderRadius="md" />
        </Stack>

        {/* Decision Type Badge */}
        <Box>
          <Skeleton height="28px" width="120px" borderRadius="md" />
        </Box>

        {/* Decision text */}
        <SkeletonSection label lines={2} />

        {/* Situation text */}
        <SkeletonSection label lines={3} />

        {/* Biases (optional) */}
        <Box pt={2}>
          <Skeleton height="16px" width="60px" mb={2} />
          <Stack direction="row" gap={2}>
            <Skeleton height="24px" width="100px" borderRadius="md" />
            <Skeleton height="24px" width="120px" borderRadius="md" />
            <Skeleton height="24px" width="90px" borderRadius="md" />
          </Stack>
        </Box>
      </Stack>
    </Card.Body>
  </Card.Root>
);

DecisionCardSkeleton.displayName = 'DecisionCardSkeleton';
