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
import { getCategoryIcon, getCategoryLabel } from '@/constants/decisions';

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

export const DecisionDetail = ({
  decision: initialDecision,
}: DecisionDetailProps) => {
  const router = useRouter();
  const [decision, setDecision] = useState(initialDecision);
  const [isPolling, setIsPolling] = useState(
    initialDecision.status === 'PENDING' ||
      initialDecision.status === 'PROCESSING'
  );
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Poll for updates when status is PENDING or PROCESSING
  useEffect(() => {
    if (!isPolling) return;

    const interval = setInterval(async () => {
      const result = await getDecision(decision.id);

      if (result.success && result.data) {
        setDecision(result.data);

        // Stop polling if analysis is complete or failed
        if (
          result.data.status === 'COMPLETED' ||
          result.data.status === 'FAILED'
        ) {
          setIsPolling(false);
        }
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [decision.id, isPolling]);

  const statusColor = useMemo(
    () => getStatusColor(decision.status),
    [decision.status]
  );
  const decisionTypeLabel = useMemo(
    () => getCategoryLabel(decision.decisionType),
    [decision.decisionType]
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
          title: 'Re-analysis Started',
          description: 'Your decision is being re-analyzed...',
          type: 'success',
          duration: 3000,
        });

        // Start polling again
        setIsPolling(true);
      } else {
        toaster.create({
          title: 'Error',
          description: result.error || 'Failed to re-analyze decision',
          type: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error re-analyzing:', error);
      toaster.create({
        title: 'Error',
        description: 'An unexpected error occurred',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsReanalyzing(false);
    }
  }, [decision.id]);

  const handleBackClick = useCallback(() => {
    router.push('/decisions');
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
          <Heading size="2xl">Decision Details</Heading>
          <Badge colorPalette={statusColor} size="lg">
            {decision.status}
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
                  Situation
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
                  Decision
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
                    Reasoning
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
                  Created
                </Text>
                <Text>{formattedDate}</Text>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Analysis Results */}
        {decision.status === 'COMPLETED' && (
          <Card.Root>
            <Card.Header>
              <Heading size="xl">AI Analysis</Heading>
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
                      Decision Type
                    </Text>
                    <Badge colorPalette="blue" size="lg">
                      <Stack direction="row" align="center" gap={1.5}>
                        {getCategoryIcon(decision.decisionType)}
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
                      Potential Cognitive Biases
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
                      Overlooked Alternatives
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
                      Additional Insights
                    </Text>
                    <Text whiteSpace="pre-wrap">{decision.insights}</Text>
                  </Box>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Processing State */}
        {(decision.status === 'PENDING' ||
          decision.status === 'PROCESSING') && (
          <Card.Root>
            <Card.Body>
              <VStack gap={3}>
                <Text fontWeight="bold" fontSize="lg">
                  Analysis in Progress
                </Text>
                <Text
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                  textAlign="center"
                >
                  Your decision is being analyzed by AI. This usually takes a
                  few seconds...
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Error State */}
        {decision.status === 'FAILED' && (
          <Card.Root colorPalette="red">
            <Card.Body>
              <VStack gap={3}>
                <Text fontWeight="bold" fontSize="lg">
                  Analysis Failed
                </Text>
                <Text
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                  textAlign="center"
                >
                  {decision.errorMessage ||
                    'An error occurred while analyzing your decision.'}
                </Text>
                <Button
                  colorPalette="red"
                  variant="outline"
                  onClick={handleReanalyze}
                  loading={isReanalyzing}
                  loadingText="Retrying..."
                >
                  Retry Analysis
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Actions */}
        <Button variant="outline" onClick={handleBackClick} alignSelf="start">
          Back to Decisions
        </Button>
      </VStack>
    </Box>
  );
};

DecisionDetail.displayName = 'DecisionDetail';
