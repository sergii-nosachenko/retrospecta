'use client';

import { Box, Grid, Skeleton } from '@chakra-ui/react';

/**
 * Skeleton loader for the dashboard page.
 * Displays placeholder content for stats and charts while data is loading.
 */
export const DashboardSkeleton = () => {
  return (
    <Box p={{ base: 5, md: 8 }} maxW="7xl" mx="auto" minH="100vh">
      {/* Header skeleton */}
      <Skeleton height="40px" mb={6} width="300px" />

      {/* Stats grid skeleton */}
      <Grid gap={6} templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }}>
        <Skeleton height="120px" borderRadius="lg" />
        <Skeleton height="120px" borderRadius="lg" />
        <Skeleton height="120px" borderRadius="lg" />
        <Skeleton height="120px" borderRadius="lg" />
      </Grid>

      {/* Charts grid skeleton */}
      <Grid
        gap={6}
        mt={6}
        templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
      >
        <Skeleton height="400px" borderRadius="lg" />
        <Skeleton height="400px" borderRadius="lg" />
      </Grid>
    </Box>
  );
};

DashboardSkeleton.displayName = 'DashboardSkeleton';
