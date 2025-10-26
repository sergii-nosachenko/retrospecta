'use client';

import { useCallback } from 'react';
import { FaGoogle } from 'react-icons/fa';

import { Button, Stack } from '@chakra-ui/react';

import { signInWithGoogle } from '@/actions/auth';

export const OAuthButtons = () => {
  const handleGoogleSignIn = useCallback(() => {
    signInWithGoogle();
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
        Continue with Google
      </Button>
    </Stack>
  );
};
