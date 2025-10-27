'use client';

import { Box, Button, VStack } from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { LuBrainCircuit } from 'react-icons/lu';

import { EmptyState } from '@/components/ui/empty-state';
import { useDecisions } from '@/contexts/DecisionsContext';
import {
  deleteDecisionAction,
  reanalyzeDecisionAction,
} from '@/lib/utils/decision-actions';
import { useTranslations } from '@/translations';

import { DecisionCard } from './DecisionCard';
import { DecisionDetailModal } from './modals/DecisionDetailModal';
import { DecisionFormModal } from './modals/DecisionFormModal';

import type { Decision } from '@/types/decision';

interface DecisionListProps {
  decisions: Decision[];
}

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
