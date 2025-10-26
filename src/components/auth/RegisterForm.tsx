'use client';

import { useCallback, useState } from 'react';

import { Box, Button, Input, Stack } from '@chakra-ui/react';

import { signup } from '@/actions/auth';
import { ErrorMessage } from '@/components/auth/ErrorMessage';
import { Field } from '@/components/ui/field';

export const RegisterForm = () => {
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
      const result = await signup(formData);

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

        <Field label="Name" required>
          <Input
            name="name"
            type="text"
            placeholder="Your name"
            required
            px={4}
          />
        </Field>

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
            placeholder="Choose a password"
            required
            minLength={6}
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
          Sign Up
        </Button>
      </Stack>
    </Box>
  );
};
