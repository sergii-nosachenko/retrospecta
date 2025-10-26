'use client';

import { Box, Text } from '@chakra-ui/react';
import { memo, useMemo } from 'react';

import { useColorMode } from '@/components/ui/color-mode';
import { useTranslations } from '@/translations';

/**
 * Props for chart tooltip components
 */
interface TooltipProps {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    payload?: { name: string };
  }[];
}

/**
 * Custom tooltip component for pie charts.
 *
 * Displays a styled tooltip when hovering over pie chart segments, showing the
 * segment name and count value. Adapts styling based on light/dark color mode.
 *
 * @param active - Whether the tooltip is currently active/visible
 * @param payload - Chart data payload containing the segment name and value
 *
 * @example
 * ```tsx
 * <PieChart>
 *   <Tooltip content={<CustomPieTooltip />} />
 * </PieChart>
 * ```
 */
export const CustomPieTooltip = memo<TooltipProps>(({ active, payload }) => {
  const { colorMode } = useColorMode();
  const { t } = useTranslations();

  const isDark = useMemo(() => colorMode === 'dark', [colorMode]);

  const boxStyles = useMemo(
    () => ({
      bg: isDark ? 'gray.800' : 'white',
      borderColor: isDark ? 'gray.700' : 'gray.200',
    }),
    [isDark]
  );

  const titleColor = useMemo(
    () => (isDark ? 'gray.100' : 'gray.900'),
    [isDark]
  );

  const textColor = useMemo(() => (isDark ? 'gray.300' : 'gray.600'), [isDark]);

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <Box
      bg={boxStyles.bg}
      borderWidth="1px"
      borderColor={boxStyles.borderColor}
      borderRadius="md"
      p={3}
      shadow="lg"
    >
      <Text fontSize="sm" fontWeight="semibold" color={titleColor}>
        {payload[0].name}
      </Text>
      <Text fontSize="sm" color={textColor}>
        {t('dashboard.chart.tooltip.count')}
        {payload[0].value}
      </Text>
    </Box>
  );
});

CustomPieTooltip.displayName = 'CustomPieTooltip';

/**
 * Custom tooltip component for bar charts.
 *
 * Displays a styled tooltip when hovering over bar chart elements, showing the
 * item name and occurrence count. Adapts styling based on light/dark color mode.
 *
 * @param active - Whether the tooltip is currently active/visible
 * @param payload - Chart data payload containing the bar name and value
 *
 * @example
 * ```tsx
 * <BarChart>
 *   <Tooltip content={<CustomBarTooltip />} />
 * </BarChart>
 * ```
 */
export const CustomBarTooltip = memo<TooltipProps>(({ active, payload }) => {
  const { colorMode } = useColorMode();
  const { t } = useTranslations();

  const isDark = useMemo(() => colorMode === 'dark', [colorMode]);

  const boxStyles = useMemo(
    () => ({
      bg: isDark ? 'gray.800' : 'white',
      borderColor: isDark ? 'gray.700' : 'gray.200',
    }),
    [isDark]
  );

  const titleColor = useMemo(
    () => (isDark ? 'gray.100' : 'gray.900'),
    [isDark]
  );

  const textColor = useMemo(() => (isDark ? 'gray.300' : 'gray.600'), [isDark]);

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <Box
      bg={boxStyles.bg}
      borderWidth="1px"
      borderColor={boxStyles.borderColor}
      borderRadius="md"
      p={3}
      shadow="lg"
    >
      <Text fontSize="sm" fontWeight="semibold" color={titleColor} mb={1}>
        {payload[0].payload?.name}
      </Text>
      <Text fontSize="sm" color={textColor}>
        {t('dashboard.chart.tooltip.occurrences')}
        {payload[0].value}
      </Text>
    </Box>
  );
});

CustomBarTooltip.displayName = 'CustomBarTooltip';
