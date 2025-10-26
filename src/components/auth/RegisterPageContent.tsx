import { Text } from '@chakra-ui/react';
import Link from 'next/link';


import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/translations';

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
