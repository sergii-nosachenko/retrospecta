'use client';

import { Text, VStack } from '@chakra-ui/react';
import { memo } from 'react';

import { DecisionSection } from '@/components/decisions/shared/DecisionSection';
import { useTranslations } from '@/translations';

import type { Decision } from '@/contexts/DecisionsContext';

interface DecisionDetailBodyProps {
  decision: Decision;
}

/**
 * Body component for the decision detail modal.
 * Displays the core decision information: situation, decision, reasoning, and creation date.
 *
 * @param decision - The decision object to display
 */
const DecisionDetailBodyComponent = ({ decision }: DecisionDetailBodyProps) => {
  const { t } = useTranslations();

  return (
    <VStack gap={4} align="stretch">
      <DecisionSection label={t('decisions.detail.sections.situation')}>
        <Text whiteSpace="pre-wrap" lineHeight="1.7">
          {decision.situation}
        </Text>
      </DecisionSection>

      <DecisionSection label={t('decisions.detail.sections.decision')}>
        <Text whiteSpace="pre-wrap" lineHeight="1.7">
          {decision.decision}
        </Text>
      </DecisionSection>

      {decision.reasoning && (
        <DecisionSection label={t('decisions.detail.sections.reasoning')}>
          <Text whiteSpace="pre-wrap" lineHeight="1.7">
            {decision.reasoning}
          </Text>
        </DecisionSection>
      )}

      <DecisionSection label={t('decisions.detail.sections.created')}>
        <Text lineHeight="1.7">
          {new Date(decision.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </DecisionSection>
    </VStack>
  );
};

export const DecisionDetailBody = memo(DecisionDetailBodyComponent);
DecisionDetailBody.displayName = 'DecisionDetailBody';
