import { Text } from '@chakra-ui/react';
import Link from 'next/link';

import { AuthDivider } from '@/components/auth/common/AuthDivider';
import { AuthPageLayout } from '@/components/auth/common/AuthPageLayout';
import { OAuthButtons } from '@/components/auth/common/OAuthButtons';
import { RegisterForm } from '@/components/auth/forms/RegisterForm';
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/translations';

/**
 * Registration page content component that renders the complete sign-up interface.
 *
 * Provides OAuth authentication options, email/password registration form, and a link
 * to the login page for existing users. Uses the AuthPageLayout for consistent styling
 * across auth pages.
 *
 * @example
 * ```tsx
 * <RegisterPageContent />
 * ```
 */
export const RegisterPageContent = () => {
  const { t } = useTranslations();
  return (
    <AuthPageLayout
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
    >
      <OAuthButtons />
      <AuthDivider text={t('auth.register.orRegisterWith')} />
      <RegisterForm />
      <Text fontSize="sm" textAlign="center" color="gray.600">
        {t('auth.register.hasAccount')}{' '}
        <Link
          href={ROUTES.LOGIN}
          style={{ color: 'var(--chakra-colors-blue-500)' }}
        >
          {t('auth.register.signInLink')}
        </Link>
      </Text>
    </AuthPageLayout>
  );
};
