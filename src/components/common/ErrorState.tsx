import { Box, Button, Stack } from '@chakra-ui/react';
import { memo } from 'react';

import { useTranslations } from '@/translations';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Internal error message display component.
 *
 * @param message - The error message text to display
 */
const ErrorMessage = memo(({ message }: { message: string }) => (
  <Box>{message}</Box>
));

ErrorMessage.displayName = 'ErrorMessage';

/**
 * Internal retry button component with i18n support.
 *
 * @param onRetry - Callback function triggered when the retry button is clicked
 */
const RetryButton = memo(({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslations();

  return (
    <Box>
      <Button onClick={onRetry} colorPalette="red" size="sm" px={4}>
        {t('common.actions.refresh')}
      </Button>
    </Box>
  );
});

RetryButton.displayName = 'RetryButton';

/**
 * Error state component for displaying user-friendly error messages with optional retry functionality.
 *
 * Renders a visually distinct error container with a red theme, dashed border, and optional
 * retry button. Suitable for displaying errors in data fetching, form submissions, or other
 * operations that may fail. Supports light and dark mode. Optimized with React.memo for performance.
 *
 * @param message - The error message to display to the user
 * @param onRetry - Optional callback function triggered when the retry button is clicked. If not provided, no retry button is shown
 *
 * @example
 * ```tsx
 * <ErrorState message="Failed to load data" onRetry={() => refetch()} />
 * // No retry button:
 * <ErrorState message="Something went wrong" />
 * ```
 */
export const ErrorState = memo(({ message, onRetry }: ErrorStateProps) => {
  return (
    <Stack
      p={8}
      textAlign="center"
      borderWidth="1px"
      borderRadius="lg"
      borderStyle="dashed"
      borderColor="red.300"
      bg="red.50"
      _dark={{ bg: 'red.900/20', borderColor: 'red.800' }}
      gap={4}
    >
      <ErrorMessage message={message} />
      {onRetry && <RetryButton onRetry={onRetry} />}
    </Stack>
  );
});

ErrorState.displayName = 'ErrorState';
