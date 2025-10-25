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
import { useDecisions } from '@/contexts/DecisionsContext';

import { DecisionDetailModal } from './DecisionDetailModal';
import { DecisionFormModal } from './DecisionFormModal';

interface Decision {
  id: string;
  situation: string;
  decision: string;
  reasoning: string | null;
  status: string;
  category: string | null;
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

// Memoized decision card component to prevent unnecessary re-renders
const DecisionCard = memo(function DecisionCard({
  decision,
  onClick,
  onReanalyze,
  onDelete,
}: DecisionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'PENDING':
        return 'yellow';
      case 'PROCESSING':
        return 'blue';
      case 'FAILED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return null;

    return category
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleMenuAction = (
    action: 'reanalyze' | 'delete',
    e: React.MouseEvent
  ) => {
    // Stop event propagation to prevent card click
    e.stopPropagation();

    if (action === 'reanalyze') {
      onReanalyze(decision.id);
    } else if (action === 'delete') {
      onDelete(decision.id);
    }
  };

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
            <Badge colorPalette={getStatusColor(decision.status)} px={3} py={1}>
              {decision.status}
            </Badge>
            <Stack direction="row" align="center" gap={2}>
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
                    value="reanalyze"
                    onClick={(e) =>
                      handleMenuAction(
                        'reanalyze',
                        e as unknown as React.MouseEvent
                      )
                    }
                    gap={2}
                    px={3}
                    py={2}
                  >
                    <LuRefreshCw />
                    Re-analyze
                  </MenuItem>
                  <MenuItem
                    value="delete"
                    color="red.500"
                    _dark={{ color: 'red.400' }}
                    onClick={(e) =>
                      handleMenuAction(
                        'delete',
                        e as unknown as React.MouseEvent
                      )
                    }
                    gap={2}
                    px={3}
                    py={2}
                  >
                    <LuTrash2 />
                    Delete
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
              Decision
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
              Situation
            </Text>
            <Text
              color="gray.700"
              _dark={{ color: 'gray.300' }}
              lineHeight="1.6"
            >
              {truncateText(decision.situation, 200)}
            </Text>
          </Box>

          {decision.status === 'COMPLETED' && decision.category && (
            <Stack direction="row" gap={2} flexWrap="wrap" pt={2}>
              <Badge colorPalette="blue" size="sm" px={3} py={1}>
                {getCategoryLabel(decision.category)}
              </Badge>
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
                  +{decision.biases.length - 3} more
                </Badge>
              )}
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
});

export function DecisionList({ decisions }: DecisionListProps) {
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
        optimisticUpdateStatus(decisionId, 'PROCESSING');

        const result = await reanalyzeDecision(decisionId);

        if (result.success) {
          toaster.create({
            title: 'Re-analysis Started',
            description: 'Your decision is being re-analyzed...',
            type: 'info',
            duration: 2000,
          });
        } else {
          // Revert optimistic update on error
          optimisticUpdateStatus(decisionId, 'COMPLETED');

          toaster.create({
            title: 'Error',
            description: result.error || 'Failed to re-analyze decision',
            type: 'error',
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error re-analyzing:', error);

        // Revert optimistic update on error
        optimisticUpdateStatus(decisionId, 'COMPLETED');

        toaster.create({
          title: 'Error',
          description: 'An unexpected error occurred',
          type: 'error',
          duration: 5000,
        });
      }
    },
    [optimisticUpdateStatus]
  );

  const handleDelete = useCallback(
    async (decisionId: string) => {
      try {
        // Optimistically remove decision immediately for instant UI feedback
        optimisticDelete(decisionId);

        const result = await deleteDecision(decisionId);

        if (result.success) {
          toaster.create({
            title: 'Decision Deleted',
            description: 'Your decision has been deleted successfully',
            type: 'success',
            duration: 3000,
          });
        } else {
          toaster.create({
            title: 'Error',
            description: result.error || 'Failed to delete decision',
            type: 'error',
            duration: 5000,
          });

          // Note: SSE will restore the decision if deletion failed
        }
      } catch (error) {
        console.error('Error deleting:', error);

        toaster.create({
          title: 'Error',
          description: 'An unexpected error occurred',
          type: 'error',
          duration: 5000,
        });
      }
    },
    [optimisticDelete]
  );

  if (decisions.length === 0) {
    return (
      <EmptyState
        title="No decisions yet"
        description="Start recording your decisions to receive AI-powered insights about your decision-making patterns."
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
              New Decision
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
}
