import {
  Box,
  Card,
  Skeleton,
  SkeletonText,
  Stack,
  VStack,
} from '@chakra-ui/react';
import { memo, useMemo } from 'react';

const DecisionSkeletonCard = memo(() => (
  <Card.Root>
    <Card.Body p={6}>
      <Stack gap={4}>
        <Stack direction="row" justify="space-between" align="center">
          <Skeleton height="24px" width="100px" />
          <Skeleton height="16px" width="120px" />
        </Stack>

        <Box>
          <Skeleton height="16px" width="60px" mb={2} />
          <SkeletonText noOfLines={2} gap={2} />
        </Box>

        <Box>
          <Skeleton height="16px" width="60px" mb={2} />
          <SkeletonText noOfLines={3} gap={2} />
        </Box>
      </Stack>
    </Card.Body>
  </Card.Root>
));

DecisionSkeletonCard.displayName = 'DecisionSkeletonCard';

const SimpleSkeletonCard = memo(() => (
  <Card.Root>
    <Card.Body p={6}>
      <Stack gap={4}>
        <Skeleton height="24px" width="100px" />
        <SkeletonText noOfLines={3} gap={2} />
      </Stack>
    </Card.Body>
  </Card.Root>
));

SimpleSkeletonCard.displayName = 'SimpleSkeletonCard';

export const DecisionListSkeleton = memo(() => {
  const skeletonCards = useMemo(
    () => [1, 2, 3].map((i) => <DecisionSkeletonCard key={i} />),
    []
  );

  return (
    <VStack gap={5} align="stretch">
      {skeletonCards}
    </VStack>
  );
});

DecisionListSkeleton.displayName = 'DecisionListSkeleton';

export const SimpleListSkeleton = memo(({ count = 3 }: { count?: number }) => {
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
});

SimpleListSkeleton.displayName = 'SimpleListSkeleton';
