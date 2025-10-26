'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useEffect, useState } from 'react';
import { LuArrowLeft } from 'react-icons/lu';

import Link from 'next/link';

import { useChart } from '@chakra-ui/charts';
import {
  Box,
  Grid,
  Group,
  Heading,
  IconButton,
  Skeleton,
  Text,
} from '@chakra-ui/react';

import {
  type DashboardAnalytics,
  getDashboardAnalytics,
} from '@/actions/decisions';
import { useColorMode } from '@/components/ui/color-mode';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
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
    }

    fetchAnalytics();
  }, []);

  if (loading) {
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
  }

  if (error || !analytics) {
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
            {error || 'Failed to load analytics'}
          </Heading>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={{ base: 5, md: 8 }} maxW="7xl" mx="auto" minH="100vh">
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

      {/* Stats Cards */}
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

      {/* Charts */}
      <Grid gap={6} templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}>
        {/* Category Distribution */}
        {analytics.categoryDistribution.length > 0 ? (
          <CategoryChart data={analytics.categoryDistribution} />
        ) : (
          <EmptyChart title="Decision Categories" />
        )}

        {/* Bias Distribution */}
        {analytics.biasDistribution.length > 0 ? (
          <BiasChart data={analytics.biasDistribution} />
        ) : (
          <EmptyChart title="Cognitive Biases" />
        )}
      </Grid>
    </Box>
  );
}

// Custom Tooltip Components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomPieTooltip({ active, payload }: any) {
  const { colorMode } = useColorMode();

  if (active && payload && payload.length) {
    return (
      <Box
        bg={colorMode === 'dark' ? 'gray.800' : 'white'}
        borderWidth="1px"
        borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        borderRadius="md"
        p={3}
        shadow="lg"
      >
        <Text
          fontSize="sm"
          fontWeight="semibold"
          color={colorMode === 'dark' ? 'gray.100' : 'gray.900'}
        >
          {payload[0].name}
        </Text>
        <Text
          fontSize="sm"
          color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
        >
          Count: {payload[0].value}
        </Text>
      </Box>
    );
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomBarTooltip({ active, payload }: any) {
  const { colorMode } = useColorMode();

  if (active && payload && payload.length) {
    return (
      <Box
        bg={colorMode === 'dark' ? 'gray.800' : 'white'}
        borderWidth="1px"
        borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
        borderRadius="md"
        p={3}
        shadow="lg"
      >
        <Text
          fontSize="sm"
          fontWeight="semibold"
          color={colorMode === 'dark' ? 'gray.100' : 'gray.900'}
          mb={1}
        >
          {payload[0].payload.name}
        </Text>
        <Text
          fontSize="sm"
          color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
        >
          Occurrences: {payload[0].value}
        </Text>
      </Box>
    );
  }
  return null;
}

// Stats Card Component
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Box
      bg="white"
      _dark={{ bg: 'gray.800' }}
      borderRadius="lg"
      p={6}
      shadow="sm"
      borderLeft="4px solid"
      borderColor={`${color}.500`}
    >
      <Text color="gray.600" _dark={{ color: 'gray.400' }} fontSize="sm" mb={1}>
        {label}
      </Text>
      <Text
        fontSize="3xl"
        fontWeight="bold"
        color={`${color}.600`}
        _dark={{ color: `${color}.400` }}
      >
        {value}
      </Text>
    </Box>
  );
}

// Category Distribution Donut Chart
function CategoryChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  // Assign colors to categories
  const colors = [
    'blue.solid',
    'green.solid',
    'purple.solid',
    'orange.solid',
    'pink.solid',
    'teal.solid',
    'red.solid',
    'cyan.solid',
    'yellow.solid',
  ];

  const chartData = data.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
  }));

  const chart = useChart({
    data: chartData,
  });

  return (
    <Box
      bg="white"
      _dark={{ bg: 'gray.800' }}
      borderRadius="lg"
      p={{ base: 4, md: 6 }}
      shadow="sm"
      overflow="hidden"
    >
      <Heading mb={4} size="md">
        Decision Categories
      </Heading>
      <Box width="100%" height={{ base: '350px', md: '300px' }}>
        <ResponsiveContainer width="99%" height="100%">
          <PieChart>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} iconSize={10} />
            <Pie
              data={chart.data}
              dataKey={chart.key('value')}
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="35%"
              outerRadius="65%"
              label={false}
            >
              {chart.data.map((item) => (
                <Cell key={item.name} fill={chart.color(item.color)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

// Bias Distribution Bar Chart
function BiasChart({ data }: { data: Array<{ name: string; count: number }> }) {
  const chart = useChart({
    data,
    series: [{ name: 'count', color: 'teal.solid' }],
  });

  return (
    <Box
      bg="white"
      _dark={{ bg: 'gray.800' }}
      borderRadius="lg"
      p={{ base: 4, md: 6 }}
      shadow="sm"
      overflow="hidden"
    >
      <Heading mb={4} size="md">
        Top Cognitive Biases
      </Heading>
      <Box width="100%" height={{ base: '400px', md: '300px' }}>
        <ResponsiveContainer width="99%" height="100%">
          <BarChart
            data={chart.data}
            margin={{ top: 5, right: 5, left: -20, bottom: 80 }}
          >
            <CartesianGrid
              stroke={chart.color('border.muted')}
              vertical={false}
            />
            <XAxis
              dataKey={chart.key('name')}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <YAxis tick={{ fontSize: 10 }} width={40} />
            <Tooltip content={<CustomBarTooltip />} />
            {chart.series.map((item) => (
              <Bar
                key={item.name}
                dataKey={chart.key(item.name)}
                fill={chart.color(item.color)}
                radius={[8, 8, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

// Empty State for Charts
function EmptyChart({ title }: { title: string }) {
  return (
    <Box
      bg="white"
      _dark={{ bg: 'gray.800' }}
      borderRadius="lg"
      p={6}
      shadow="sm"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="400px"
    >
      <Heading mb={2} size="md">
        {title}
      </Heading>
      <Text color="gray.500" _dark={{ color: 'gray.400' }}>
        No data available yet. Complete some decision analyses to see insights!
      </Text>
    </Box>
  );
}
