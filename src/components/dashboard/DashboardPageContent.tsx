'use client';

import { Box, Grid, Group, Heading, IconButton } from '@chakra-ui/react';
import Link from 'next/link';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { LuArrowLeft } from 'react-icons/lu';

import {
  type DashboardAnalytics,
  getDashboardAnalytics,
} from '@/actions/decisions';
import { DashboardSkeleton } from '@/components/common/skeletons';
import { BiasChart } from '@/components/dashboard/charts/BiasChart';
import { DecisionTypeChart } from '@/components/dashboard/charts/DecisionTypeChart';
import { EmptyChart } from '@/components/dashboard/charts/EmptyChart';
import { StatCard } from '@/components/dashboard/StatCard';
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/translations';

/**
 * Props for the ErrorState component
 */
interface ErrorStateProps {
  error: string;
}

/**
 * Error state display component for dashboard errors.
 *
 * Shows an error message in a styled red container when dashboard data fails to load.
 *
 * @param error - Error message to display
 */
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

/**
 * Props for the DashboardStats component
 */
interface DashboardStatsProps {
  analytics: DashboardAnalytics;
}

/**
 * Dashboard statistics cards display component.
 *
 * Renders a responsive grid of StatCard components showing key metrics like
 * total decisions, completed analyses, pending processing, and recent decisions.
 *
 * @param analytics - Dashboard analytics data containing aggregated statistics
 */
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

/**
 * Props for the DashboardCharts component
 */
interface DashboardChartsProps {
  analytics: DashboardAnalytics;
}

/**
 * Dashboard charts display component.
 *
 * Renders visualization charts for decision type distribution and bias distribution
 * in a responsive grid layout. Shows EmptyChart placeholders when no data is available.
 *
 * @param analytics - Dashboard analytics data containing chart data distributions
 */
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

/**
 * Dashboard page header component.
 *
 * Displays the dashboard title with a back navigation button to return to the decisions list.
 */
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

/**
 * Main dashboard page content component.
 *
 * Fetches and displays comprehensive analytics about user decisions, including statistics
 * cards and visualization charts. Handles loading states, error states, and data fetching
 * from the server.
 *
 * Features:
 * - Automatic data fetching on mount
 * - Loading skeleton during data fetch
 * - Error state display on failure
 * - Statistics cards showing key metrics
 * - Charts for decision type and bias distributions
 *
 * @example
 * ```tsx
 * <DashboardPageContent />
 * ```
 */
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
    return <DashboardSkeleton />;
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
