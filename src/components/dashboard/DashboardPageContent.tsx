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
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/translations';

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
  const { t } = useTranslations();

  return (
    <Grid
      gap={6}
      mb={8}
      templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }}
    >
      <StatCard
        label={t('dashboard.stats.totalDecisions')}
        value={analytics.totalDecisions}
        color="blue"
      />
      <StatCard
        label={t('dashboard.stats.completedAnalyses')}
        value={analytics.completedAnalyses}
        color="green"
      />
      <StatCard
        label={t('dashboard.stats.pendingProcessing')}
        value={analytics.pendingAnalyses}
        color="orange"
      />
      <StatCard
        label={t('dashboard.stats.recent')}
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
  const { t } = useTranslations();

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
        <EmptyChart title={t('decisions.detail.sections.decisionType')} />
      )}

      {hasBiasData ? (
        <BiasChart data={analytics.biasDistribution} />
      ) : (
        <EmptyChart title={t('decisions.detail.sections.biases')} />
      )}
    </Grid>
  );
});

DashboardCharts.displayName = 'DashboardCharts';

const DashboardHeader = memo(() => {
  const { t } = useTranslations();

  return (
    <Group gap={3} mb={8} alignItems="center">
      <IconButton
        asChild
        variant="ghost"
        size="lg"
        aria-label={t('common.actions.backToDashboard')}
      >
        <Link href={ROUTES.DECISIONS}>
          <LuArrowLeft />
        </Link>
      </IconButton>
      <Heading size="2xl">{t('dashboard.title')}</Heading>
    </Group>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export const DashboardPageContent = memo(() => {
  const { t } = useTranslations();
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
        setError(result.error ?? t('dashboard.errors.loadFailed'));
      }
    } catch (error_) {
      console.error('Error fetching analytics:', error_);
      setError(t('dashboard.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !analytics) {
    return <ErrorState error={error ?? t('dashboard.errors.loadFailed')} />;
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
