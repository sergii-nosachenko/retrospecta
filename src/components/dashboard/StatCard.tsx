import { Box, Text } from '@chakra-ui/react';
import { memo } from 'react';

/**
 * Props for the StatCard component
 */
interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

/**
 * Statistic card component for displaying numerical metrics.
 *
 * Renders a card with a colored left border, a descriptive label, and a large numerical
 * value. Commonly used in dashboard layouts to highlight key performance indicators.
 *
 * @param label - Descriptive text label for the statistic
 * @param value - Numerical value to display
 * @param color - Color theme name (e.g., 'blue', 'green', 'orange') for the accent border and text
 *
 * @example
 * ```tsx
 * <StatCard
 *   label="Total Decisions"
 *   value={42}
 *   color="blue"
 * />
 * ```
 */
export const StatCard = memo<StatCardProps>(({ label, value, color }) => {
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
});

StatCard.displayName = 'StatCard';
