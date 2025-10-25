'use client';

import { useState } from 'react';

import { Box, Button, Input, Stack, Text } from '@chakra-ui/react';

import { login } from '@/actions/auth';
import { Field } from '@/components/ui/field';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack gap={4}>
        {error && (
          <Box
            p={3}
            borderRadius="md"
            bg="red.500/10"
            borderWidth="1px"
            borderColor="red.500"
          >
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          </Box>
        )}

        <Field label="Email" required>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </Field>

        <Field label="Password" required>
          <Input
            name="password"
            type="password"
            placeholder="Your password"
            required
          />
        </Field>

        <Button
          type="submit"
          colorPalette="blue"
          loading={loading}
          width="full"
          size="lg"
          py={3}
        >
          Sign In
        </Button>
      </Stack>
    </Box>
  );
}
