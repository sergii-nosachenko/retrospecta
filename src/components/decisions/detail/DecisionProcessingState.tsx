'use client';

import { Box, Text, VStack } from '@chakra-ui/react';

import { useTranslations } from '@/translations';

/**
 * Displays the processing/analyzing state for pending or processing decisions.
 * Shows a message indicating that analysis is in progress.
 */
export const DecisionProcessingState = () => {
  const { t } = useTranslations();

  return (
    <Box
      px={6}
      py={5}
      borderWidth="1px"
      borderRadius="lg"
      bg="blue.50"
      _dark={{ bg: 'blue.900/20' }}
      textAlign="center"
    >
      <VStack gap={3}>
        <Text fontWeight="bold" fontSize="lg">
          {t('decisions.detail.states.analyzing.title')}
        </Text>
        <Text
          color="gray.600"
          _dark={{ color: 'gray.400' }}
          lineHeight="1.6"
          px={2}
        >
          {t('decisions.detail.states.analyzing.description')}
        </Text>
      </VStack>
    </Box>
  );
};

DecisionProcessingState.displayName = 'DecisionProcessingState';
