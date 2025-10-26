import { memo } from 'react';

import { Stack } from '@chakra-ui/react';

import { useTranslations } from '@/translations';

import { FeatureCard } from './FeatureCard';

export const FeatureGrid = memo(() => {
  const { t } = useTranslations();

  const FEATURES = [
    {
      icon: t('landing.features.understand.icon'),
      title: t('landing.features.understand.title'),
      description: t('landing.features.understand.description'),
    },
    {
      icon: t('landing.features.biases.icon'),
      title: t('landing.features.biases.title'),
      description: t('landing.features.biases.description'),
    },
    {
      icon: t('landing.features.alternatives.icon'),
      title: t('landing.features.alternatives.title'),
      description: t('landing.features.alternatives.description'),
    },
  ] as const;

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
