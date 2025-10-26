import { Box, Button, Stack, Text } from '@chakra-ui/react';
import Link from 'next/link';

import { AuthPageLayout } from '@/components/auth/common/AuthPageLayout';
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/translations';

/**
 * Email confirmation page content component displayed after user registration.
 *
 * Informs users that they need to verify their email address before accessing the
 * application. Includes helpful reminders to check spam folders and provides a link
 * back to the login page.
 *
 * @example
 * ```tsx
 * <ConfirmEmailPageContent />
 * ```
 */
export const ConfirmEmailPageContent = () => {
  const { t } = useTranslations();

  return (
    <AuthPageLayout
      title={t('auth.confirmEmail.title')}
      subtitle={t('auth.confirmEmail.subtitle')}
    >
      <Stack gap={4}>
        <Box
          p={4}
          bg="blue.50"
          _dark={{ bg: 'blue.900' }}
          borderRadius="md"
          borderLeft="4px solid"
          borderLeftColor="blue.500"
        >
          <Text color="gray.700" _dark={{ color: 'gray.300' }}>
            {t('auth.confirmEmail.message')}
          </Text>
        </Box>

        <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
          {t('auth.confirmEmail.checkSpam')}
        </Text>

        <Button asChild variant="outline" w="full">
          <Link href={ROUTES.LOGIN}>{t('auth.confirmEmail.backToLogin')}</Link>
        </Button>
      </Stack>
    </AuthPageLayout>
  );
};
