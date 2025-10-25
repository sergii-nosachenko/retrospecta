import Link from 'next/link';

import { Box, Button, Container, Heading, Stack, Text } from '@chakra-ui/react';

export default function Home() {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      _dark={{ bg: 'gray.900' }}
    >
      <Container maxW="4xl" p={8}>
        <Stack gap={8} alignItems="center" textAlign="center">
          <Stack gap={4}>
            <Heading size="4xl" fontWeight="bold">
              Retrospecta
            </Heading>
            <Text fontSize="2xl" color="gray.600" _dark={{ color: 'gray.400' }}>
              AI-Powered Decision Journal
            </Text>
          </Stack>

          <Text
            fontSize="lg"
            maxW="2xl"
            color="gray.700"
            _dark={{ color: 'gray.300' }}
          >
            Record your important life and work decisions, and receive deep
            insights through AI analysis. Discover decision patterns, cognitive
            biases, and overlooked alternatives to make better choices.
          </Text>

          <Stack direction="row" gap={4}>
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

          <Stack gap={6} mt={8} maxW="2xl">
            <Box>
              <Heading size="md" mb={2}>
                🎯 Understand Your Decisions
              </Heading>
              <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                Get AI-powered analysis that categorizes your decision-making
                style and identifies patterns.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>
                🧠 Identify Cognitive Biases
              </Heading>
              <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                Discover hidden biases that might be influencing your choices.
              </Text>
            </Box>

            <Box>
              <Heading size="md" mb={2}>
                💡 Explore Alternatives
              </Heading>
              <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                Uncover overlooked options and perspectives you might have
                missed.
              </Text>
            </Box>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
