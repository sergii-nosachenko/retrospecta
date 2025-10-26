'use client';

import { Box, Text } from '@chakra-ui/react';

export interface SectionHeaderProps {
  /** The section label text */
  label: string;
  /** Style variant - 'bold' for detail views with uppercase, 'normal' for lists/cards */
  variant?: 'bold' | 'normal';
  /** Optional content to display below the label */
  children?: React.ReactNode;
  /** Additional margin bottom override */
  mb?: number | { base?: number; md?: number };
}

/**
 * Reusable section header component with consistent styling
 *
 * Supports two variants:
 * - 'bold': Uppercase, bold, letter-spaced (for detail/modal views)
 * - 'normal': Semibold, no transform (for list/card views)
 *
 * Can be used standalone (just label) or with children (label + content wrapper)
 *
 * @example
 * ```tsx
 * // Standalone label
 * <SectionHeader label="Decision" variant="normal" />
 *
 * // With content wrapper
 * <SectionHeader label="Analysis Results" variant="bold">
 *   <AnalysisContent />
 * </SectionHeader>
 * ```
 */
export const SectionHeader = ({
  label,
  variant = 'bold',
  children,
  mb,
}: SectionHeaderProps) => {
  const isBold = variant === 'bold';

  const labelElement = (
    <Text
      fontWeight={isBold ? 'bold' : 'semibold'}
      mb={mb ?? (isBold ? 3 : 2)}
      fontSize="sm"
      color="gray.600"
      _dark={{ color: 'gray.400' }}
      textTransform={isBold ? 'uppercase' : 'none'}
      letterSpacing={isBold ? 'wide' : 'normal'}
    >
      {label}
    </Text>
  );

  // If no children, return just the label
  if (!children) {
    return labelElement;
  }

  // If children provided, wrap in Box
  return (
    <Box>
      {labelElement}
      {children}
    </Box>
  );
};

SectionHeader.displayName = 'SectionHeader';
