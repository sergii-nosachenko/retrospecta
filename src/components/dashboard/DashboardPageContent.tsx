'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { LuArrowLeft } from 'react-icons/lu';

import Link from 'next/link';

import {
  Box,
  Grid,
  Group,
  Heading,
  IconButton,
  Skeleton,
} from '@chakra-ui/react';

import {
  type DashboardAnalytics,
  getDashboardAnalytics,
} from '@/actions/decisions';
import { BiasChart } from '@/components/dashboard/BiasChart';
import { DecisionTypeChart } from '@/components/dashboard/DecisionTypeChart';
import { EmptyChart } from '@/components/dashboard/EmptyChart';
import { StatCard } from '@/components/dashboard/StatCard';

const LoadingState = memo(() => {
  return (
    <Box p={{ base: 5, md: 8 }} maxW="7xl" mx="auto" minH="100vh">
      <Skeleton height="40px" mb={6} width="300px" />
      <Grid gap={6} templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }}>
        <Skeleton height="120px" />
        <Skeleton height="120px" />
        <Skeleton height="120px" />
        <Skeleton height="120px" />
      </Grid>
      <Grid
        gap={6}
        mt={6}
        templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
      >
        <Skeleton height="400px" />
        <Skeleton height="400px" />
      </Grid>
    </Box>
  );
});

LoadingState.displayName = 'LoadingState';

interface ErrorStateProps {
  error: string;
}

const ErrorState = memo<ErrorStateProps>(({ error }) => {
  return (
    <Box p={{ base: 5, md: 8 }} maxW="7xl" mx="auto" minH="100vh">
      <Box
        bg="red.50"
        _dark={{ bg: 'red.900/20' }}
        borderRadius="lg"
        p={6}
        textAlign="center"
      >
        <Heading color="red.600" _dark={{ color: 'red.400' }} size="md">
          {error}
        </Heading>
      </Box>
    </Box>
  );
});

ErrorState.displayName = 'ErrorState';

interface DashboardStatsProps {
  analytics: DashboardAnalytics;
}

const DashboardStats = memo<DashboardStatsProps>(({ analytics }) => {
  return (
    <Grid
      gap={6}
      mb={8}
      templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }}
    >
      <StatCard
        label="Total Decisions"
        value={analytics.totalDecisions}
        color="blue"
      />
      <StatCard
        label="Completed Analyses"
        value={analytics.completedAnalyses}
        color="green"
      />
      <StatCard
        label="Pending/Processing"
        value={analytics.pendingAnalyses}
        color="orange"
      />
      <StatCard
        label="Recent (7 days)"
        value={analytics.recentDecisions}
        color="purple"
      />
    </Grid>
  );
});

DashboardStats.displayName = 'DashboardStats';

interface DashboardChartsProps {
  analytics: DashboardAnalytics;
}

const DashboardCharts = memo<DashboardChartsProps>(({ analytics }) => {
  const hasDecisionTypeData = useMemo(
    () => analytics.decisionTypeDistribution.length > 0,
    [analytics.decisionTypeDistribution.length]
  );

  const hasBiasData = useMemo(
    () => analytics.biasDistribution.length > 0,
    [analytics.biasDistribution.length]
  );

  return (
    <Grid gap={6} templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}>
      {hasDecisionTypeData ? (
        <DecisionTypeChart data={analytics.decisionTypeDistribution} />
      ) : (
        <EmptyChart title="Decision Types" />
      )}

      {hasBiasData ? (
        <BiasChart data={analytics.biasDistribution} />
      ) : (
        <EmptyChart title="Cognitive Biases" />
      )}
    </Grid>
  );
});

DashboardCharts.displayName = 'DashboardCharts';

const DashboardHeader = memo(() => {
  return (
    <Group gap={3} mb={8} alignItems="center">
      <IconButton
        asChild
        variant="ghost"
        size="lg"
        aria-label="Back to decisions"
      >
        <Link href="/decisions">
          <LuArrowLeft />
        </Link>
      </IconButton>
      <Heading size="2xl">Dashboard</Heading>
    </Group>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export const DashboardPageContent = memo(() => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getDashboardAnalytics();

      if (result.success && result.data) {
        setAnalytics(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !analytics) {
    return <ErrorState error={error || 'Failed to load analytics'} />;
  }

  return (
    <Box p={{ base: 5, md: 8 }} maxW="7xl" mx="auto" minH="100vh">
      <DashboardHeader />
      <DashboardStats analytics={analytics} />
      <DashboardCharts analytics={analytics} />
    </Box>
  );
});

DashboardPageContent.displayName = 'DashboardPageContent';
