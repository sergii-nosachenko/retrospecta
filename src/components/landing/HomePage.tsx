import { memo } from 'react';

import Link from 'next/link';

import { Box, Button, Container, Heading, Stack, Text } from '@chakra-ui/react';

import { AnimatedBackground } from '@/components/common/AnimatedBackground';
import { IconReveal } from '@/components/common/IconReveal';
import { FeatureGrid } from '@/components/landing/FeatureGrid';

const HeroHeader = memo(() => (
  <Stack gap={4}>
    <IconReveal />
    <Heading size={{ base: '2xl', sm: '3xl', md: '4xl' }} fontWeight="bold">
      Retrospecta
    </Heading>
    <Text
      fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }}
      color="gray.600"
      _dark={{ color: 'gray.400' }}
    >
      AI-Powered Decision Journal
    </Text>
  </Stack>
));

HeroHeader.displayName = 'HeroHeader';

const HeroDescription = memo(() => (
  <Text fontSize="lg" maxW="2xl" color="gray.700" _dark={{ color: 'gray.300' }}>
    Record your important life and work decisions, and receive deep insights
    through AI analysis. Discover decision patterns, cognitive biases, and
    overlooked alternatives to make better choices.
  </Text>
));

HeroDescription.displayName = 'HeroDescription';

const CTAButtons = memo(() => (
  <Stack
    direction={{ base: 'column', sm: 'row' }}
    gap={4}
    width={{ base: 'full', sm: 'auto' }}
  >
    <Link href="/register">
      <Button size="lg" colorPalette="blue" px={8} py={3}>
        Get Started
      </Button>
    </Link>
    <Link href="/login">
      <Button size="lg" variant="outline" px={8} py={3}>
        Sign In
      </Button>
    </Link>
  </Stack>
));

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
