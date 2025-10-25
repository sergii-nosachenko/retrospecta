'use client';

import { FaGoogle } from 'react-icons/fa';

import { Button, Stack } from '@chakra-ui/react';

import { signInWithGoogle } from '@/actions/auth';

export function OAuthButtons() {
  return (
    <Stack gap={3}>
      <Button variant="outline" onClick={() => signInWithGoogle()} width="full">
        <FaGoogle />
        Continue with Google
      </Button>
    </Stack>
  );
}
