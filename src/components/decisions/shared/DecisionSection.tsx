'use client';

import { Box, Text } from '@chakra-ui/react';

interface DecisionSectionProps {
  label: string;
  children: React.ReactNode;
}

/**
 * Reusable section wrapper for displaying decision information.
 * Provides consistent styling for labels and content across all decision components.
 *
 * @param label - The section label displayed at the top
 * @param children - The content to display below the label
 */
export const DecisionSection = ({ label, children }: DecisionSectionProps) => (
  <Box>
    <Text
      fontWeight="bold"
      mb={3}
      fontSize="sm"
      color="gray.600"
      _dark={{ color: 'gray.400' }}
      textTransform="uppercase"
      letterSpacing="wide"
    >
      {label}
    </Text>
    {children}
  </Box>
);

DecisionSection.displayName = 'DecisionSection';
