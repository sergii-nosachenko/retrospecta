import { Box, Text } from '@chakra-ui/react';
import { memo } from 'react';


interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

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
