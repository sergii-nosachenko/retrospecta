import Link from 'next/link';

import { Text } from '@chakra-ui/react';

import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/translations';

export const LoginPageContent = () => {
  const { t } = useTranslations();
  return (
    <AuthPageLayout
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
    >
      <OAuthButtons />
      <AuthDivider text={t('auth.login.orContinueWith')} />
      <LoginForm />
      <Text fontSize="sm" textAlign="center" color="gray.600">
        {t('auth.login.noAccount')}{' '}
        <Link
          href={ROUTES.REGISTER}
          style={{ color: 'var(--chakra-colors-blue-500)' }}
        >
          {t('auth.login.signUpLink')}
        </Link>
      </Text>
    </AuthPageLayout>
  );
};
