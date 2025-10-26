'use client';

import { memo, useCallback, useState } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { LuBrainCircuit, LuRefreshCw, LuTrash2 } from 'react-icons/lu';

import {
  Badge,
  Box,
  Button,
  Card,
  IconButton,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';

import { reanalyzeDecision } from '@/actions/analysis';
import { deleteDecision } from '@/actions/decisions';
import { EmptyState } from '@/components/ui/empty-state';
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from '@/components/ui/menu';
import { toaster } from '@/components/ui/toaster';
import {
  getDecisionTypeIcon,
  getDecisionTypeLabel,
} from '@/constants/decisions';
import { useDecisions } from '@/contexts/DecisionsContext';
import { type TFunction, useTranslations } from '@/translations';
import { DecisionActionType, ProcessingStatus } from '@/types/enums';

import { DecisionDetailModal } from './DecisionDetailModal';
import { DecisionFormModal } from './DecisionFormModal';

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

// Utility functions for decision cards
const getStatusColor = (status: string) => {
  switch (status) {
    case ProcessingStatus.COMPLETED:
      return 'green';
    case ProcessingStatus.PENDING:
      return 'yellow';
    case ProcessingStatus.PROCESSING:
      return 'blue';
    case ProcessingStatus.FAILED:
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusLabel = (status: ProcessingStatus, t: TFunction) => {
  switch (status) {
    case ProcessingStatus.COMPLETED:
      return t('decisions.list.status.completed');
    case ProcessingStatus.PENDING:
      return t('decisions.list.status.pending');
    case ProcessingStatus.PROCESSING:
      return t('decisions.list.status.processing');
    case ProcessingStatus.FAILED:
      return t('decisions.list.status.failed');
    default:
      return status;
  }
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength))}...`;
};

// Memoized decision card component to prevent unnecessary re-renders
const DecisionCard = memo(
  ({ decision, onClick, onReanalyze, onDelete }: DecisionCardProps) => {
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

    return (
      <Card.Root
        _hover={{ shadow: 'md', cursor: 'pointer' }}
        transition="all 0.2s"
        onClick={() => onClick(decision.id)}
      >
        <Card.Body p={6}>
          <Stack gap={4}>
            <Stack
              direction={{ base: 'column', sm: 'row' }}
              justify="space-between"
              align={{ base: 'start', sm: 'center' }}
              gap={3}
            >
              {decision.decisionType ? (
                <Badge colorPalette="blue" px={3} py={1}>
                  <Stack direction="row" align="center" gap={1.5}>
                    {getDecisionTypeIcon(decision.decisionType)}
                    <span>
                      {getDecisionTypeLabel(t, decision.decisionType)}
                    </span>
                  </Stack>
                </Badge>
              ) : (
                <Box />
              )}
              <Stack direction="row" align="center" gap={2}>
                <Badge
                  colorPalette={getStatusColor(decision.status)}
                  px={3}
                  py={1}
                >
                  {getStatusLabel(decision.status, t)}
                </Badge>
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
                <MenuRoot positioning={{ placement: 'bottom-end' }}>
                  <MenuTrigger asChild>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <HiOutlineDotsVertical />
                    </IconButton>
                  </MenuTrigger>
                  <MenuContent minW="150px">
                    <MenuItem
                      value={DecisionActionType.REANALYZE}
                      onClick={(event) =>
                        handleMenuAction(DecisionActionType.REANALYZE, event)
                      }
                      gap={2}
                      px={3}
                      py={2}
                    >
                      <LuRefreshCw />
                      {t('decisions.list.actions.reAnalyze')}
                    </MenuItem>
                    <MenuItem
                      value={DecisionActionType.DELETE}
                      color="red.500"
                      _dark={{ color: 'red.400' }}
                      onClick={(e) =>
                        handleMenuAction(
                          DecisionActionType.DELETE,
                          e as unknown as React.MouseEvent
                        )
                      }
                      gap={2}
                      px={3}
                      py={2}
                    >
                      <LuTrash2 />
                      {t('decisions.list.actions.delete')}
                    </MenuItem>
                  </MenuContent>
                </MenuRoot>
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
                <Stack direction="row" gap={2} flexWrap="wrap" pt={2}>
                  {decision.biases.slice(0, 3).map((bias, index) => (
                    <Badge
                      key={index}
                      colorPalette="orange"
                      size="sm"
                      px={3}
                      py={1}
                    >
                      {bias}
                    </Badge>
                  ))}
                  {decision.biases.length > 3 && (
                    <Badge colorPalette="gray" size="sm" px={3} py={1}>
                      {t('decisions.list.actions.showMore', {
                        count: decision.biases.length - 3,
                      })}
                    </Badge>
                  )}
                </Stack>
              )}
          </Stack>
        </Card.Body>
      </Card.Root>
    );
  }
);

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

  const handleReanalyze = useCallback(
    async (decisionId: string) => {
      try {
        // Optimistically update status immediately for instant UI feedback
        optimisticUpdateStatus(decisionId, ProcessingStatus.PROCESSING);

        const result = await reanalyzeDecision(decisionId);

        if (result.success) {
          toaster.create({
            title: t('toasts.success.reAnalysisStarted.title'),
            description: t('toasts.success.reAnalysisStarted.description'),
            type: 'info',
            duration: 2000,
          });
        } else {
          // Revert optimistic update on error
          optimisticUpdateStatus(decisionId, ProcessingStatus.COMPLETED);

          toaster.create({
            title: t('toasts.error.title'),
            description: result.error ?? t('toasts.errors.reAnalyze'),
            type: 'error',
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error re-analyzing:', error);

        // Revert optimistic update on error
        optimisticUpdateStatus(decisionId, ProcessingStatus.COMPLETED);

        toaster.create({
          title: t('toasts.error.title'),
          description: t('toasts.errors.unexpected'),
          type: 'error',
          duration: 5000,
        });
      }
    },
    [optimisticUpdateStatus, t]
  );

  const handleDelete = useCallback(
    async (decisionId: string) => {
      try {
        // Optimistically remove decision immediately for instant UI feedback
        optimisticDelete(decisionId);

        const result = await deleteDecision(decisionId);

        if (result.success) {
          toaster.create({
            title: t('toasts.success.decisionDeleted.title'),
            description: t('toasts.success.decisionDeleted.description'),
            type: 'success',
            duration: 3000,
          });
        } else {
          toaster.create({
            title: t('toasts.error.title'),
            description: result.error ?? t('toasts.errors.deleteDecision'),
            type: 'error',
            duration: 5000,
          });

          // Note: SSE will restore the decision if deletion failed
        }
      } catch (error) {
        console.error('Error deleting:', error);

        toaster.create({
          title: t('toasts.error.title'),
          description: t('toasts.errors.unexpected'),
          type: 'error',
          duration: 5000,
        });
      }
    },
    [optimisticDelete, t]
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
