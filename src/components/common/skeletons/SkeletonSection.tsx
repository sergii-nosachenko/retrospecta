'use client';

import { Box, Skeleton, SkeletonText } from '@chakra-ui/react';

interface SkeletonSectionProps {
  /**
   * Whether to show a label skeleton above the content
   */
  label?: boolean;
  /**
   * Number of lines to show in the skeleton text
   */
  lines?: number;
  /**
   * Custom skeleton content instead of SkeletonText
   */
  children?: React.ReactNode;
}

/**
 * Reusable skeleton section component for consistent loading states.
 * Used across decision details, cards, and other components.
 *
 * @example
 * // With label and text lines
 * <SkeletonSection label lines={3} />
 *
 * @example
 * // With custom content
 * <SkeletonSection label>
 *   <Skeleton height="20px" width="200px" />
 * </SkeletonSection>
 *
 * @example
 * // Without label
 * <SkeletonSection lines={2} />
 */
export const SkeletonSection = ({
  label,
  lines,
  children,
}: SkeletonSectionProps) => (
  <Box>
    {label && <Skeleton height="16px" width="80px" mb={3} />}
    {lines ? <SkeletonText noOfLines={lines} gap={2} /> : children}
  </Box>
);

SkeletonSection.displayName = 'SkeletonSection';
