import { memo } from 'react';

import { Stack } from '@chakra-ui/react';

import { FeatureCard } from './FeatureCard';

const FEATURES = [
  {
    icon: '🎯',
    title: 'Understand Your Decisions',
    description:
      'Get AI-powered analysis that categorizes your decision-making style and identifies patterns.',
  },
  {
    icon: '🧠',
    title: 'Identify Cognitive Biases',
    description:
      'Discover hidden biases that might be influencing your choices.',
  },
  {
    icon: '💡',
    title: 'Explore Alternatives',
    description:
      'Uncover overlooked options and perspectives you might have missed.',
  },
] as const;

export const FeatureGrid = memo(() => {
  return (
    <Stack
      direction={{ base: 'column', lg: 'row' }}
      gap={6}
      mt={8}
      maxW="4xl"
      alignItems="stretch"
    >
      {FEATURES.map((feature) => (
        <FeatureCard
          key={feature.title}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </Stack>
  );
});

FeatureGrid.displayName = 'FeatureGrid';
