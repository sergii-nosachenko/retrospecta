import { Text } from '@chakra-ui/react';
import Link from 'next/link';

import { AuthDivider } from '@/components/auth/common/AuthDivider';
import { AuthPageLayout } from '@/components/auth/common/AuthPageLayout';
import { OAuthButtons } from '@/components/auth/common/OAuthButtons';
import { LoginForm } from '@/components/auth/forms/LoginForm';
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/translations';

/**
 * Login page content component that renders the complete login interface.
 *
 * Provides OAuth authentication options, email/password login form, and a link to the
 * registration page. Uses the AuthPageLayout for consistent styling across auth pages.
 *
 * @example
 * ```tsx
 * <LoginPageContent />
 * ```
 */
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
