import { Box, Text } from '@chakra-ui/react';
import { memo } from 'react';

interface ErrorMessageProps {
  message: string;
}

/**
 * Error message component for displaying authentication-related errors.
 *
 * Renders error messages in a visually distinct red-themed box with consistent styling
 * across all authentication forms. Optimized with React.memo for performance.
 *
 * @param message - The error message text to display
 *
 * @example
 * ```tsx
 * <ErrorMessage message="Invalid email or password" />
 * ```
 */
export const ErrorMessage = memo(({ message }: ErrorMessageProps) => {
  return (
    <Box
      p={3}
      borderRadius="md"
      bg="red.500/10"
      borderWidth="1px"
      borderColor="red.500"
    >
      <Text color="red.500" fontSize="sm">
        {message}
      </Text>
    </Box>
  );
});

ErrorMessage.displayName = 'ErrorMessage';
