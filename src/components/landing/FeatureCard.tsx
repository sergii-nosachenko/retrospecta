import { memo } from 'react';

import { Box, Heading, Text } from '@chakra-ui/react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export const FeatureCard = memo(
  ({ icon, title, description }: FeatureCardProps) => {
    return (
      <Box flex={1}>
        <Heading size="md" mb={2}>
          {icon} {title}
        </Heading>
        <Text color="gray.600" _dark={{ color: 'gray.400' }}>
          {description}
        </Text>
      </Box>
    );
  }
);

FeatureCard.displayName = 'FeatureCard';
