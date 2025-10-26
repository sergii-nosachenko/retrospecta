import { memo, useCallback } from 'react';

import { Box, Button, Stack } from '@chakra-ui/react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage = memo(({ message }: { message: string }) => (
  <Box>{message}</Box>
));

ErrorMessage.displayName = 'ErrorMessage';

const RetryButton = memo(({ onRetry }: { onRetry: () => void }) => {
  const handleClick = useCallback(() => {
    onRetry();
  }, [onRetry]);

  return (
    <Box>
      <Button onClick={handleClick} colorPalette="red" size="sm" px={4}>
        Refresh
      </Button>
    </Box>
  );
});

RetryButton.displayName = 'RetryButton';

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
