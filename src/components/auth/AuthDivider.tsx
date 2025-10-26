import { memo } from 'react';

import { Box, Text } from '@chakra-ui/react';

interface AuthDividerProps {
  text?: string;
}

export const AuthDivider = memo(
  ({ text = 'Or continue with email' }: AuthDividerProps) => {
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
            {text}
          </Text>
        </Box>
      </Box>
    );
  }
);

AuthDivider.displayName = 'AuthDivider';
