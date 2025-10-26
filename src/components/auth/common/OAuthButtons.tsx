'use client';

import { Button, Stack } from '@chakra-ui/react';
import { useState } from 'react';
import { FaGoogle } from 'react-icons/fa';

import { signInWithGoogle } from '@/actions/auth';
import { ErrorMessage } from '@/components/auth/ErrorMessage';
import { useTranslations } from '@/translations';

export const OAuthButtons = () => {
  const { t } = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    const result = await signInWithGoogle();

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <Stack gap={3}>
      {error && <ErrorMessage message={error} />}

      <Button
        variant="outline"
        onClick={handleGoogleSignIn}
        loading={loading}
        width="full"
        size="lg"
        py={3}
      >
        <FaGoogle />
        {t('auth.oauth.google')}
      </Button>
    </Stack>
  );
};
