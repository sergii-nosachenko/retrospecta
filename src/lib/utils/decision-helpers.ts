import { ProcessingStatus } from '@/types/enums';

/**
 * Returns the color palette for a given decision status.
 * Used for consistent badge coloring across the application.
 *
 * @param status - The processing status of the decision
 * @returns Color palette name for Chakra UI components
 */
export const getStatusColor = (status: ProcessingStatus | string): string => {
  const colorMap: Record<ProcessingStatus, string> = {
    [ProcessingStatus.COMPLETED]: 'green',
    [ProcessingStatus.PENDING]: 'yellow',
    [ProcessingStatus.PROCESSING]: 'blue',
    [ProcessingStatus.FAILED]: 'red',
  };

  return colorMap[status as ProcessingStatus] ?? 'gray';
};
