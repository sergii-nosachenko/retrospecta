'use client';

import { useChart } from '@chakra-ui/charts';
import { Box, Heading } from '@chakra-ui/react';
import { memo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useTranslations } from '@/translations';

import { CustomBarTooltip } from '../ChartTooltips';

interface BiasChartProps {
  data: { name: string; count: number }[];
}

const CHART_MARGIN = { top: 5, right: 5, left: -20, bottom: 80 } as const;
const BAR_RADIUS: [number, number, number, number] = [8, 8, 0, 0];

const BIAS_COLORS = [
  'teal.solid',
  'blue.solid',
  'purple.solid',
  'orange.solid',
  'pink.solid',
  'green.solid',
  'red.solid',
  'cyan.solid',
  'yellow.solid',
  'violet.solid',
] as const;

export const BiasChart = memo<BiasChartProps>(({ data }) => {
  const { t } = useTranslations();

  // Translate bias names from enum keys to human-readable labels and assign colors
  const translatedData = data.map((item, index) => ({
    ...item,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: t(`decisions.biases.${item.name}` as any) || item.name,
    fill: BIAS_COLORS[index % BIAS_COLORS.length],
  }));

  const chart = useChart({
    data: translatedData,
    series: [{ name: 'count' as const }],
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
        {t('decisions.detail.sections.biases')}
      </Heading>
      <Box width="100%" height={{ base: '400px', md: '300px' }}>
        <ResponsiveContainer width="99%" height="100%">
          <BarChart data={chart.data} margin={CHART_MARGIN}>
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
            <Bar dataKey={chart.key('count')} radius={BAR_RADIUS}>
              {chart.data.map((entry) => (
                <Cell key={entry.name} fill={chart.color(entry.fill)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
});

BiasChart.displayName = 'BiasChart';
