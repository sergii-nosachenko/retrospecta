'use client';

import { Badge, Box, Heading, Stack, Text, VStack } from '@chakra-ui/react';
import { memo } from 'react';

import { DecisionSection } from '@/components/decisions/shared/DecisionSection';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import {
  getBiasLabel,
  getDecisionTypeIcon,
  getDecisionTypeLabel,
} from '@/constants/decisions';
import { useTranslations } from '@/translations';

import type { Decision } from '@/contexts/DecisionsContext';

interface DecisionAnalysisResultsProps {
  decision: Decision;
}

/**
 * Displays the analysis results for a completed decision.
 * Shows decision type, identified biases, alternatives, and insights.
 *
 * @param decision - The decision object with completed analysis
 */
const DecisionAnalysisResultsComponent = ({
  decision,
}: DecisionAnalysisResultsProps) => {
  const { t } = useTranslations();

  return (
    <Box
      borderTopWidth="1px"
      pt={4}
      mt={2}
      borderColor="gray.200"
      _dark={{ borderColor: 'gray.700' }}
    >
      <Heading size="lg" mb={4}>
        {t('decisions.detail.sections.analysis')}
      </Heading>

      <VStack gap={4} align="stretch">
        {decision.decisionType && (
          <DecisionSection label={t('decisions.detail.sections.decisionType')}>
            <Badge colorPalette="blue" size="lg" px={4} py={2}>
              <Stack direction="row" align="center" gap={1.5}>
                {getDecisionTypeIcon(decision.decisionType)}
                <span>{getDecisionTypeLabel(t, decision.decisionType)}</span>
              </Stack>
            </Badge>
          </DecisionSection>
        )}

        {decision.biases && decision.biases.length > 0 && (
          <DecisionSection label={t('decisions.detail.sections.biases')}>
            <Stack direction="row" wrap="wrap" gap={2}>
              {decision.biases.map((bias, index) => (
                <Badge key={index} colorPalette="orange" px={3} py={1}>
                  {getBiasLabel(t, bias)}
                </Badge>
              ))}
            </Stack>
          </DecisionSection>
        )}

        {decision.alternatives && (
          <DecisionSection label={t('decisions.detail.sections.alternatives')}>
            <MarkdownRenderer content={decision.alternatives} />
          </DecisionSection>
        )}

        {decision.insights && (
          <DecisionSection label={t('decisions.detail.sections.insights')}>
            <MarkdownRenderer content={decision.insights} />
          </DecisionSection>
        )}

        {/* Analysis metadata */}
        {decision.analysisAttempts > 1 && (
          <Box pt={4} borderTopWidth="1px">
            <Text fontSize="sm" color="gray.500">
              {t('decisions.detail.analysis.attemptCount', {
                count: decision.analysisAttempts,
              })}
              {decision.lastAnalyzedAt && (
                <>
                  {t('decisions.detail.analysis.lastAnalyzed')}
                  {new Date(decision.lastAnalyzedAt).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </>
              )}
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export const DecisionAnalysisResults = memo(DecisionAnalysisResultsComponent);
DecisionAnalysisResults.displayName = 'DecisionAnalysisResults';
