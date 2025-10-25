import Link from 'next/link';

import { Box, Card, Heading, Stack, Text } from '@chakra-ui/react';

import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
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
            <Heading size="2xl">Create Account</Heading>
            <Text color="gray.600" _dark={{ color: 'gray.400' }}>
              Start your decision-making journey
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
                Or register with email
              </Text>
            </Box>
          </Box>

          <RegisterForm />

          <Text fontSize="sm" textAlign="center" color="gray.600">
            Already have an account?{' '}
            <Link
              href="/login"
              style={{ color: 'var(--chakra-colors-blue-500)' }}
            >
              Sign in
            </Link>
          </Text>
        </Stack>
      </Card.Root>
    </Box>
  );
}
