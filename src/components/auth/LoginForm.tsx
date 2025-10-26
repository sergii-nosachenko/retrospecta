'use client';

import { Box, Button, Input, Stack } from '@chakra-ui/react';
import { useCallback, useState } from 'react';

import { login } from '@/actions/auth';
import { ErrorMessage } from '@/components/auth/ErrorMessage';
import { Field } from '@/components/ui/field';
import { useTranslations } from '@/translations';

export const LoginForm = () => {
  const { t } = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLDivElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      const formData = new FormData(
        event.currentTarget as unknown as HTMLFormElement
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

        <Field label={t('auth.login.form.email.label')} required>
          <Input
            name="email"
            type="email"
            placeholder={t('auth.login.form.email.placeholder')}
            required
            px={4}
          />
        </Field>

        <Field label={t('auth.login.form.password.label')} required>
          <Input
            name="password"
            type="password"
            placeholder={t('auth.login.form.password.placeholder')}
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
          {t('auth.login.form.submit')}
        </Button>
      </Stack>
    </Box>
  );
};
