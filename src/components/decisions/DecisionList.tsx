'use client';

import { Box, Button, Card, Stack, Text, VStack } from '@chakra-ui/react';
import { memo, useCallback, useMemo, useState } from 'react';
import { LuBrainCircuit, LuRefreshCw, LuTrash2 } from 'react-icons/lu';

import { ActionMenu } from '@/components/common';
import {
  BiasesBadgeList,
  DecisionTypeBadge,
  NewBadge,
  StatusBadge,
} from '@/components/decisions/shared';
import { EmptyState } from '@/components/ui/empty-state';
import { useDecisions } from '@/contexts/DecisionsContext';
import {
  deleteDecisionAction,
  reanalyzeDecisionAction,
} from '@/lib/utils/decision-actions';
import { useTranslations } from '@/translations';
import { DecisionActionType, ProcessingStatus } from '@/types/enums';

import { DecisionDetailModal } from './modals/DecisionDetailModal';
import { DecisionFormModal } from './modals/DecisionFormModal';

interface Decision {
  id: string;
  situation: string;
  decision: string;
  reasoning: string | null;
  status: ProcessingStatus;
  decisionType: string | null;
  biases: string[];
  alternatives: string | null;
  insights: string | null;
  isNew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DecisionListProps {
  decisions: Decision[];
}

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
    >
      <Card.Body p={6}>
        <Stack gap={4}>
          <Stack display={{ base: 'flex', sm: 'none' }} gap={3}>
            <Stack direction="row" justify="space-between" align="center">
              <Stack direction="row" align="center" gap={2}>
                <StatusBadge status={decision.status} />
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

const DecisionCard = memo(DecisionCardComponent);

/**
 * Main decision list component
 *
 * Renders a list of decision cards with interactive actions.
 * Handles decision selection, re-analysis, and deletion with optimistic updates.
 * Shows empty state when no decisions exist with a prompt to create one.
 *
 * Features:
 * - Renders decision cards with click-to-view detail modal
 * - Re-analyze action for individual decisions
 * - Delete action with optimistic UI updates
 * - Empty state with create decision prompt
 * - Context integration for optimistic updates
 *
 * @param decisions - Array of decisions to display
 *
 * @example
 * ```tsx
 * <DecisionList decisions={userDecisions} />
 * ```
 */
export const DecisionList = ({ decisions }: DecisionListProps) => {
  const { t } = useTranslations();
  const { optimisticUpdateStatus, optimisticDelete } = useDecisions();
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDecisionClick = useCallback((decisionId: string) => {
    setSelectedDecisionId(decisionId);
    setIsModalOpen(true);
  }, []);

  const handleReanalyze = useCallback(
    async (decisionId: string) => {
      await reanalyzeDecisionAction(decisionId, {
        optimisticUpdateStatus,
        optimisticDelete,
        t,
      });
    },
    [optimisticUpdateStatus, optimisticDelete, t]
  );

  const handleDelete = useCallback(
    async (decisionId: string) => {
      await deleteDecisionAction(decisionId, {
        optimisticUpdateStatus,
        optimisticDelete,
        t,
      });
    },
    [optimisticUpdateStatus, optimisticDelete, t]
  );

  if (decisions.length === 0) {
    return (
      <EmptyState
        title={t('decisions.list.empty.title')}
        description={t('decisions.list.empty.description')}
        py={12}
        icon={
          <Box color="gray.400" _dark={{ color: 'gray.600' }} fontSize="128px">
            <LuBrainCircuit />
          </Box>
        }
      >
        <DecisionFormModal
          trigger={
            <Button colorPalette="blue" size="lg" mt={4} px={6}>
              {t('decisions.list.empty.cta')}
            </Button>
          }
        />
      </EmptyState>
    );
  }

  return (
    <>
      <VStack gap={5} align="stretch">
        {decisions.map((decision) => (
          <DecisionCard
            key={decision.id}
            decision={decision}
            onClick={handleDecisionClick}
            onReanalyze={handleReanalyze}
            onDelete={handleDelete}
          />
        ))}
      </VStack>

      {selectedDecisionId && (
        <DecisionDetailModal
          decisionId={selectedDecisionId}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  );
};

DecisionList.displayName = 'DecisionList';
