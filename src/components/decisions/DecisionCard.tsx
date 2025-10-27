'use client';

import { Box, Card, Spinner, Stack, Text } from '@chakra-ui/react';
import { memo, useCallback, useMemo } from 'react';
import { LuRefreshCw, LuTrash2 } from 'react-icons/lu';

import { ActionMenu } from '@/components/common';
import {
  BiasesBadgeList,
  DecisionTypeBadge,
  NewBadge,
  StatusBadge,
} from '@/components/decisions/shared';
import { useTranslations } from '@/translations';
import { DecisionActionType, ProcessingStatus } from '@/types/enums';

import type { Decision } from '@/types/decision';

interface DecisionCardProps {
  decision: Decision;
  onClick: (id: string) => void;
  onReanalyze: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Utility function for truncating text to a maximum length
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength))}...`;
};

/**
 * Individual decision card component with actions
 *
 * Displays a single decision card with:
 * - Status badge and new indicator
 * - Decision type badge
 * - Situation and decision text (truncated)
 * - Identified biases
 * - Action menu for reanalyze/delete
 * - Responsive layout (mobile/desktop)
 * - Optimistic loading state (spinner and overlay)
 *
 * Memoized to prevent unnecessary re-renders.
 *
 * @param decision - The decision to display
 * @param onClick - Callback when card is clicked (opens detail modal)
 * @param onReanalyze - Callback to trigger re-analysis
 * @param onDelete - Callback to delete decision
 */
const DecisionCardComponent = ({
  decision,
  onClick,
  onReanalyze,
  onDelete,
}: DecisionCardProps) => {
  const { t } = useTranslations();

  const handleMenuAction = useCallback(
    (action: DecisionActionType, event: React.MouseEvent) => {
      event.stopPropagation();

      if (action === DecisionActionType.REANALYZE) {
        onReanalyze(decision.id);

        return;
      }

      if (action === DecisionActionType.DELETE) {
        onDelete(decision.id);
      }
    },
    [decision.id, onReanalyze, onDelete]
  );

  const menuItems = useMemo(
    () => [
      {
        value: DecisionActionType.REANALYZE,
        label: t('decisions.list.actions.reAnalyze'),
        icon: <LuRefreshCw />,
        onClick: (event: React.MouseEvent) =>
          handleMenuAction(DecisionActionType.REANALYZE, event),
      },
      {
        value: DecisionActionType.DELETE,
        label: t('decisions.list.actions.delete'),
        icon: <LuTrash2 />,
        onClick: (event: React.MouseEvent) =>
          handleMenuAction(DecisionActionType.DELETE, event),
        destructive: true,
      },
    ],
    [t, handleMenuAction]
  );

  return (
    <Card.Root
      _hover={{ shadow: 'md', cursor: 'pointer' }}
      transition="all 0.2s"
      onClick={() => onClick(decision.id)}
      opacity={decision.isOptimistic ? 0.7 : 1}
      position="relative"
    >
      {decision.isOptimistic && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blue.50"
          _dark={{ bg: 'blue.900' }}
          opacity={0.3}
          pointerEvents="none"
          borderRadius="md"
        />
      )}
      <Card.Body p={6}>
        <Stack gap={4}>
          <Stack display={{ base: 'flex', sm: 'none' }} gap={3}>
            <Stack direction="row" justify="space-between" align="center">
              <Stack direction="row" align="center" gap={2}>
                <StatusBadge status={decision.status} />
                {decision.isOptimistic && (
                  <Spinner
                    size="sm"
                    color="blue.500"
                    _dark={{ color: 'blue.400' }}
                  />
                )}
                {decision.isNew && <NewBadge />}
                <Text
                  fontSize="sm"
                  color="gray.500"
                  _dark={{ color: 'gray.400' }}
                >
                  {new Date(decision.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </Stack>

              <ActionMenu items={menuItems} />
            </Stack>

            {decision.decisionType && (
              <Box width="fit-content">
                <DecisionTypeBadge decisionType={decision.decisionType} />
              </Box>
            )}
          </Stack>

          <Stack
            display={{ base: 'none', sm: 'flex' }}
            direction="row"
            justify="space-between"
            align="center"
          >
            {decision.decisionType ? (
              <DecisionTypeBadge decisionType={decision.decisionType} />
            ) : (
              <Box />
            )}
            <Stack direction="row" align="center" gap={2}>
              <StatusBadge status={decision.status} />
              {decision.isOptimistic && (
                <Spinner
                  size="sm"
                  color="blue.500"
                  _dark={{ color: 'blue.400' }}
                />
              )}
              {decision.isNew && <NewBadge />}
              <Text
                fontSize="sm"
                color="gray.500"
                _dark={{ color: 'gray.400' }}
              >
                {new Date(decision.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <ActionMenu items={menuItems} />
            </Stack>
          </Stack>

          <Box>
            <Text
              fontWeight="semibold"
              mb={2}
              fontSize="sm"
              color="gray.600"
              _dark={{ color: 'gray.400' }}
            >
              {t('decisions.list.columns.decision')}
            </Text>
            <Text fontSize="lg" fontWeight="medium" lineHeight="1.6">
              {truncateText(decision.decision, 150)}
            </Text>
          </Box>

          <Box>
            <Text
              fontWeight="semibold"
              mb={2}
              fontSize="sm"
              color="gray.600"
              _dark={{ color: 'gray.400' }}
            >
              {t('decisions.list.columns.situation')}
            </Text>
            <Text
              color="gray.700"
              _dark={{ color: 'gray.300' }}
              lineHeight="1.6"
            >
              {truncateText(decision.situation, 200)}
            </Text>
          </Box>

          {decision.status === ProcessingStatus.COMPLETED &&
            decision.biases.length > 0 && (
              <Box pt={2}>
                <Text
                  fontWeight="semibold"
                  mb={2}
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                >
                  {t('decisions.detail.sections.biases')}
                </Text>
                <BiasesBadgeList biases={decision.biases} maxDisplay={3} />
              </Box>
            )}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export const DecisionCard = memo(DecisionCardComponent);

DecisionCard.displayName = 'DecisionCard';
