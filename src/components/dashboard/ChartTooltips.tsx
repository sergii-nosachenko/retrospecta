'use client';

import { Box, Text } from '@chakra-ui/react';
import { memo, useMemo } from 'react';


import { useColorMode } from '@/components/ui/color-mode';
import { useTranslations } from '@/translations';

interface TooltipProps {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    payload?: { name: string };
  }[];
}

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
