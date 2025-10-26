'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Badge,
  Box,
  Button,
  Card,
  Heading,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';

import { reanalyzeDecision } from '@/actions/analysis';
import { getDecision } from '@/actions/decisions';
import { toaster } from '@/components/ui/toaster';
import {
  getDecisionTypeIcon,
  getDecisionTypeLabel,
  getStatusLabel,
} from '@/constants/decisions';
import { ROUTES } from '@/constants/routes';
import { useTranslations } from '@/translations';
import { ProcessingStatus } from '@/types/enums';

interface DecisionData {
  id: string;
  situation: string;
  decision: string;
  reasoning: string | null;
  status: string;
  decisionType: string | null;
  biases: string[];
  alternatives: string | null;
  insights: string | null;
  analysisAttempts: number;
  lastAnalyzedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DecisionDetailProps {
  decision: DecisionData;
}

const getStatusColor = (status: string): string => {
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

export const DecisionDetail = ({
  decision: initialDecision,
}: DecisionDetailProps) => {
  const { t } = useTranslations();
  const router = useRouter();
  const [decision, setDecision] = useState(initialDecision);
  const [isPolling, setIsPolling] = useState(
    initialDecision.status === ProcessingStatus.PENDING ||
      initialDecision.status === ProcessingStatus.PROCESSING
  );
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Poll for updates when status is PENDING or PROCESSING
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(() => {
      void (async () => {
        const result = await getDecision(decision.id);

        if (result.success && result.data) {
          setDecision(result.data);

          // Stop polling if analysis is complete or failed
          if (
            result.data.status === ProcessingStatus.COMPLETED ||
            result.data.status === ProcessingStatus.FAILED
          ) {
            setIsPolling(false);
          }
        }
      })();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [decision.id, isPolling]);

  const statusColor = useMemo(
    () => getStatusColor(decision.status),
    [decision.status]
  );
  const decisionTypeLabel = useMemo(
    () => getDecisionTypeLabel(t, decision.decisionType),
    [decision.decisionType, t]
  );

  const formattedDate = useMemo(
    () =>
      new Date(decision.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [decision.createdAt]
  );

  const handleReanalyze = useCallback(async () => {
    setIsReanalyzing(true);

    try {
      const result = await reanalyzeDecision(decision.id);

      if (result.success) {
        toaster.create({
          title: t('toasts.success.reAnalysisStarted.title'),
          description: t('toasts.success.reAnalysisStarted.description'),
          type: 'success',
          duration: 3000,
        });

        // Start polling again
        setIsPolling(true);
      } else {
        toaster.create({
          title: t('toasts.error.title'),
          description: result.error ?? t('toasts.errors.reAnalyze'),
          type: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error re-analyzing:', error);
      toaster.create({
        title: t('toasts.error.title'),
        description: t('toasts.errors.unexpected'),
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsReanalyzing(false);
    }
  }, [decision.id, t]);

  const handleBackClick = useCallback(() => {
    router.push(ROUTES.DECISIONS);
  }, [router]);

  return (
    <Box maxW="4xl" mx="auto">
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Stack
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align={{ base: 'start', sm: 'center' }}
          gap={4}
        >
          <Heading size="2xl">{t('decisions.detail.title')}</Heading>
          <Badge colorPalette={statusColor} size="lg">
            {getStatusLabel(t, decision.status)}
          </Badge>
        </Stack>

        {/* Decision Information */}
        <Card.Root>
          <Card.Body>
            <VStack gap={6} align="stretch">
              <Box>
                <Text
                  fontWeight="bold"
                  mb={2}
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                >
                  {t('decisions.detail.sections.situation')}
                </Text>
                <Text>{decision.situation}</Text>
              </Box>

              <Box>
                <Text
                  fontWeight="bold"
                  mb={2}
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                >
                  {t('decisions.detail.sections.decision')}
                </Text>
                <Text>{decision.decision}</Text>
              </Box>

              {decision.reasoning && (
                <Box>
                  <Text
                    fontWeight="bold"
                    mb={2}
                    color="gray.600"
                    _dark={{ color: 'gray.400' }}
                  >
                    {t('decisions.detail.sections.reasoning')}
                  </Text>
                  <Text>{decision.reasoning}</Text>
                </Box>
              )}

              <Box>
                <Text
                  fontWeight="bold"
                  mb={2}
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                >
                  {t('decisions.detail.sections.created')}
                </Text>
                <Text>{formattedDate}</Text>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Analysis Results */}
        {decision.status === ProcessingStatus.COMPLETED && (
          <Card.Root>
            <Card.Header>
              <Heading size="xl">
                {t('decisions.detail.sections.analysis')}
              </Heading>
            </Card.Header>
            <Card.Body>
              <VStack gap={6} align="stretch">
                {decision.decisionType && (
                  <Box>
                    <Text
                      fontWeight="bold"
                      mb={2}
                      color="gray.600"
                      _dark={{ color: 'gray.400' }}
                    >
                      {t('decisions.detail.sections.decisionType')}
                    </Text>
                    <Badge colorPalette="blue" size="lg">
                      <Stack direction="row" align="center" gap={1.5}>
                        {getDecisionTypeIcon(decision.decisionType)}
                        <span>{decisionTypeLabel}</span>
                      </Stack>
                    </Badge>
                  </Box>
                )}

                {decision.biases && decision.biases.length > 0 && (
                  <Box>
                    <Text
                      fontWeight="bold"
                      mb={2}
                      color="gray.600"
                      _dark={{ color: 'gray.400' }}
                    >
                      {t('decisions.detail.sections.biases')}
                    </Text>
                    <Stack direction="row" wrap="wrap" gap={2}>
                      {decision.biases.map((bias, index) => (
                        <Badge key={index} colorPalette="orange">
                          {bias}
                        </Badge>
                      ))}
                    </Stack>
                  </Box>
                )}

                {decision.alternatives && (
                  <Box>
                    <Text
                      fontWeight="bold"
                      mb={2}
                      color="gray.600"
                      _dark={{ color: 'gray.400' }}
                    >
                      {t('decisions.detail.sections.alternatives')}
                    </Text>
                    <Text whiteSpace="pre-wrap">{decision.alternatives}</Text>
                  </Box>
                )}

                {decision.insights && (
                  <Box>
                    <Text
                      fontWeight="bold"
                      mb={2}
                      color="gray.600"
                      _dark={{ color: 'gray.400' }}
                    >
                      {t('decisions.detail.sections.insights')}
                    </Text>
                    <Text whiteSpace="pre-wrap">{decision.insights}</Text>
                  </Box>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Processing State */}
        {(decision.status === ProcessingStatus.PENDING ||
          decision.status === ProcessingStatus.PROCESSING) && (
          <Card.Root>
            <Card.Body>
              <VStack gap={3}>
                <Text fontWeight="bold" fontSize="lg">
                  {t('decisions.detail.states.analyzing.title')}
                </Text>
                <Text
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                  textAlign="center"
                >
                  {t('decisions.detail.states.analyzing.description')}
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Error State */}
        {decision.status === ProcessingStatus.FAILED && (
          <Card.Root colorPalette="red">
            <Card.Body>
              <VStack gap={3}>
                <Text fontWeight="bold" fontSize="lg">
                  {t('decisions.detail.states.failed.title')}
                </Text>
                <Text
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                  textAlign="center"
                >
                  {decision.errorMessage ??
                    t('decisions.detail.states.failed.description')}
                </Text>
                <Button
                  colorPalette="red"
                  variant="outline"
                  onClick={handleReanalyze}
                  loading={isReanalyzing}
                  loadingText={t('common.actions.retrying')}
                >
                  {t('decisions.detail.states.failed.retry')}
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Actions */}
        <Button variant="outline" onClick={handleBackClick} alignSelf="start">
          {t('common.actions.back')}
        </Button>
      </VStack>
    </Box>
  );
};

DecisionDetail.displayName = 'DecisionDetail';
