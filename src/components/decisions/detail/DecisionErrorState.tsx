'use client';

import { Box, Button, Text, VStack } from '@chakra-ui/react';

import { useTranslations } from '@/translations';

interface DecisionErrorStateProps {
  error: string | null;
  onRetry: () => void;
  isRetrying: boolean;
}

/**
 * Displays the error state for failed decision analysis.
 * Shows error message and provides a retry button.
 *
 * @param error - The error message to display
 * @param onRetry - Callback to retry the analysis
 * @param isRetrying - Whether a retry is in progress
 */
export const DecisionErrorState = ({
  error,
  onRetry,
  isRetrying,
}: DecisionErrorStateProps) => {
  const { t } = useTranslations();

  return (
    <Box
      px={6}
      py={5}
      borderWidth="1px"
      borderRadius="lg"
      bg="red.50"
      borderColor="red.200"
      _dark={{ bg: 'red.900/20', borderColor: 'red.800' }}
    >
      <VStack gap={4}>
        <Text
          fontWeight="bold"
          fontSize="lg"
          color="red.700"
          _dark={{ color: 'red.300' }}
        >
          {t('decisions.detail.states.failed.title')}
        </Text>
        <Text
          color="gray.600"
          _dark={{ color: 'gray.400' }}
          textAlign="center"
          lineHeight="1.6"
          px={2}
        >
          {error ?? t('decisions.detail.states.failed.description')}
        </Text>
        <Button
          colorPalette="red"
          variant="outline"
          onClick={onRetry}
          loading={isRetrying}
          loadingText={t('common.actions.retrying')}
          size="lg"
        >
          {t('decisions.detail.states.failed.retry')}
        </Button>
      </VStack>
    </Box>
  );
};

DecisionErrorState.displayName = 'DecisionErrorState';
