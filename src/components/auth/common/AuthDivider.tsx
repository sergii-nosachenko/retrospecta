import { Box, Text } from '@chakra-ui/react';
import { memo } from 'react';

import { useTranslations } from '@/translations';

interface AuthDividerProps {
  text?: string;
}

/**
 * Horizontal divider component with centered text for authentication pages.
 *
 * Creates a visual separation between different authentication methods (e.g., between
 * OAuth buttons and email/password forms). Features a horizontal line with centered
 * text overlay. Supports light/dark mode and uses i18n for default text.
 * Optimized with React.memo for performance.
 *
 * @param text - Optional custom text to display in the divider. Falls back to translated "or continue with" text
 *
 * @example
 * ```tsx
 * <AuthDivider text="or" />
 * // Uses default i18n text:
 * <AuthDivider />
 * ```
 */
export const AuthDivider = memo(({ text }: AuthDividerProps) => {
  const { t } = useTranslations();
  const displayText = text ?? t('auth.login.orContinueWith');

  return (
    <Box position="relative">
      <Box position="absolute" inset="0" display="flex" alignItems="center">
        <Box w="full" borderTopWidth="1px" borderColor="gray.200" />
      </Box>
      <Box position="relative" display="flex" justifyContent="center">
        <Text
          px={2}
          bg="white"
          _dark={{ bg: 'gray.800' }}
          color="gray.500"
          fontSize="sm"
        >
          {displayText}
        </Text>
      </Box>
    </Box>
  );
});

AuthDivider.displayName = 'AuthDivider';
