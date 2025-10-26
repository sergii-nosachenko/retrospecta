'use client';

import { useChart } from '@chakra-ui/charts';
import { Box, Heading } from '@chakra-ui/react';
import { memo, useMemo } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { useTranslations } from '@/translations';

import { CustomPieTooltip } from '../ChartTooltips';

interface DecisionTypeChartProps {
  data: { name: string; value: number }[];
}

const DECISION_TYPE_COLORS = [
  'blue.solid',
  'green.solid',
  'purple.solid',
  'orange.solid',
  'pink.solid',
  'teal.solid',
  'red.solid',
  'cyan.solid',
  'yellow.solid',
] as const;

const LEGEND_STYLE = { fontSize: '12px' } as const;

export const DecisionTypeChart = memo<DecisionTypeChartProps>(({ data }) => {
  const { t } = useTranslations();

  const chartData = useMemo(
    () =>
      data.map((item, index) => ({
        ...item,
        color: DECISION_TYPE_COLORS[index % DECISION_TYPE_COLORS.length],
      })),
    [data]
  );

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
        {t('decisions.detail.sections.decisionType')}
      </Heading>
      <Box width="100%" height={{ base: '350px', md: '300px' }}>
        <ResponsiveContainer width="99%" height="100%">
          <PieChart>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend wrapperStyle={LEGEND_STYLE} iconSize={10} />
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
});

DecisionTypeChart.displayName = 'DecisionTypeChart';
