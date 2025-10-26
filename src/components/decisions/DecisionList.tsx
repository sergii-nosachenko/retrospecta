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

// Utility function for truncating text
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength))}...`;
};

// Memoized decision card component to prevent unnecessary re-renders
const DecisionCardComponent = ({
  decision,
  onClick,
  onReanalyze,
  onDelete,
}: DecisionCardProps) => {
  const { t } = useTranslations();

  const handleMenuAction = useCallback(
    (action: DecisionActionType, event: React.MouseEvent) => {
      // Stop event propagation to prevent card click
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
          {/* Mobile layout: Status + Date + Menu first, then Decision Type */}
          <Stack display={{ base: 'flex', sm: 'none' }} gap={3}>
            {/* Status + Date + Menu block */}
            <Stack direction="row" justify="space-between" align="center">
              {/* Status + Date on the left */}
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

              {/* Menu on the right */}
              <ActionMenu items={menuItems} />
            </Stack>

            {/* Decision Type */}
            {decision.decisionType && (
              <Box width="fit-content">
                <DecisionTypeBadge decisionType={decision.decisionType} />
              </Box>
            )}
          </Stack>

          {/* Desktop layout: Original layout with Decision Type on left, Status + Date + Menu on right */}
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

// Memoize to prevent unnecessary re-renders
const DecisionCard = memo(DecisionCardComponent);

export const DecisionList = ({ decisions }: DecisionListProps) => {
  const { t } = useTranslations();
  const { optimisticUpdateStatus, optimisticDelete } = useDecisions();
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoize the click handler to prevent recreating it on every render
  const handleDecisionClick = useCallback((decisionId: string) => {
    setSelectedDecisionId(decisionId);
    setIsModalOpen(true);
  }, []);

  // Wrapper handlers that use the extracted utility functions
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

      {/* Decision Detail Modal */}
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
