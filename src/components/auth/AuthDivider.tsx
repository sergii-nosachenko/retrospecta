import { Box, Text } from '@chakra-ui/react';
import { memo } from 'react';

import { useTranslations } from '@/translations';

interface AuthDividerProps {
  text?: string;
}

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
