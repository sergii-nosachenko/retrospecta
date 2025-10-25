import Link from 'next/link';

import { Box, Card, Heading, Stack, Text } from '@chakra-ui/react';

import { LoginForm } from '@/components/auth/LoginForm';
import { OAuthButtons } from '@/components/auth/OAuthButtons';

export default function LoginPage() {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      _dark={{ bg: 'gray.900' }}
      p={4}
    >
      <Card.Root maxW="md" w="full" p={8}>
        <Stack gap={6}>
          <Stack gap={2} textAlign="center">
            <Heading size="2xl">Welcome Back</Heading>
            <Text color="gray.600" _dark={{ color: 'gray.400' }}>
              Sign in to your Retrospecta account
            </Text>
          </Stack>

          <OAuthButtons />

          <Box position="relative">
            <Box
              position="absolute"
              inset="0"
              display="flex"
              alignItems="center"
            >
              <Box w="full" borderTopWidth="1px" borderColor="gray.200" />
            </Box>
            <Box position="relative" display="flex" justifyContent="center">
              <Text
                px={2}
                bg="white"
                _dark={{ bg: 'gray.800' }}
                color="gray.500"
                fontSize="sm"
              >
                Or continue with email
              </Text>
            </Box>
          </Box>

          <LoginForm />

          <Text fontSize="sm" textAlign="center" color="gray.600">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              style={{ color: 'var(--chakra-colors-blue-500)' }}
            >
              Sign up
            </Link>
          </Text>
        </Stack>
      </Card.Root>
    </Box>
  );
}
