'use client';

import { useCallback, useState } from 'react';

import { Box, Button, Input, Stack } from '@chakra-ui/react';

import { login } from '@/actions/auth';
import { ErrorMessage } from '@/components/auth/ErrorMessage';
import { Field } from '@/components/ui/field';

export const LoginForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLDivElement>) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      const formData = new FormData(
        e.currentTarget as unknown as HTMLFormElement
      );
      const result = await login(formData);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    },
    []
  );

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack gap={4}>
        {error && <ErrorMessage message={error} />}

        <Field label="Email" required>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            px={4}
          />
        </Field>

        <Field label="Password" required>
          <Input
            name="password"
            type="password"
            placeholder="Your password"
            required
            px={4}
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
};
