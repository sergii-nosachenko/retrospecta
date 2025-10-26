'use client';

import { useCallback } from 'react';
import { FaGoogle } from 'react-icons/fa';

import { Button, Stack } from '@chakra-ui/react';

import { signInWithGoogle } from '@/actions/auth';
import { useTranslations } from '@/translations';

export const OAuthButtons = () => {
  const { t } = useTranslations();
  const handleGoogleSignIn = useCallback(() => {
    void signInWithGoogle();
  }, []);

  return (
    <Stack gap={3}>
      <Button
        variant="outline"
        onClick={handleGoogleSignIn}
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
