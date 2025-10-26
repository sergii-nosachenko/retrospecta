import { memo } from 'react';

import Link from 'next/link';

import { Box, Button, Container, Heading, Stack, Text } from '@chakra-ui/react';

import { AnimatedBackground } from '@/components/common/AnimatedBackground';
import { IconReveal } from '@/components/common/IconReveal';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/translations';

const HeroHeader = memo(() => {
  const { t } = useTranslations();

  return (
    <Stack gap={4}>
      <IconReveal />
      <Heading size={{ base: '2xl', sm: '3xl', md: '4xl' }} fontWeight="bold">
        {t('landing.hero.title')}
      </Heading>
      <Text
        fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }}
        color="gray.600"
        _dark={{ color: 'gray.400' }}
      >
        {t('landing.hero.subtitle')}
      </Text>
    </Stack>
  );
});

HeroHeader.displayName = 'HeroHeader';

const HeroDescription = memo(() => {
  const { t } = useTranslations();

  return (
    <Text
      fontSize="lg"
      maxW="2xl"
      color="gray.700"
      _dark={{ color: 'gray.300' }}
    >
      {t('landing.hero.description')}
    </Text>
  );
});

HeroDescription.displayName = 'HeroDescription';

const CTAButtons = memo(() => {
  const { t } = useTranslations();

  return (
    <Stack
      direction={{ base: 'column', sm: 'row' }}
      gap={4}
      width={{ base: 'full', sm: 'auto' }}
    >
      <Link href={ROUTES.REGISTER}>
        <Button size="lg" colorPalette="blue" px={8} py={3}>
          {t('landing.hero.cta.getStarted')}
        </Button>
      </Link>
      <Link href={ROUTES.LOGIN}>
        <Button size="lg" variant="outline" px={8} py={3}>
          {t('landing.hero.cta.signIn')}
        </Button>
      </Link>
    </Stack>
  );
});

CTAButtons.displayName = 'CTAButtons';

const HeroContent = memo(() => (
  <Stack gap={8} alignItems="center" textAlign="center">
    <HeroHeader />
    <HeroDescription />
    <CTAButtons />
    <FeatureGrid />
  </Stack>
));

HeroContent.displayName = 'HeroContent';

export const HomePage = memo(() => {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="transparent"
      position="relative"
      overflow="hidden"
    >
      <AnimatedBackground />
      <Container maxW="4xl" p={{ base: 4, sm: 6, md: 8 }}>
        <HeroContent />
      </Container>
    </Box>
  );
});

HomePage.displayName = 'HomePage';
