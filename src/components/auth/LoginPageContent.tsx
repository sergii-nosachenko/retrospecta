import Link from 'next/link';

import { Text } from '@chakra-ui/react';

import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { OAuthButtons } from '@/components/auth/OAuthButtons';

export const LoginPageContent = () => {
  return (
    <AuthPageLayout
      title="Welcome Back"
      subtitle="Sign in to your Retrospecta account"
    >
      <OAuthButtons />
      <AuthDivider text="Or continue with email" />
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
    </AuthPageLayout>
  );
};
