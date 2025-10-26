import Link from 'next/link';

import { Text } from '@chakra-ui/react';

import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const RegisterPageContent = () => {
  return (
    <AuthPageLayout
      title="Create Account"
      subtitle="Start your decision-making journey"
    >
      <OAuthButtons />
      <AuthDivider text="Or register with email" />
      <RegisterForm />
      <Text fontSize="sm" textAlign="center" color="gray.600">
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--chakra-colors-blue-500)' }}>
          Sign in
        </Link>
      </Text>
    </AuthPageLayout>
  );
};
