'use client';

import { useEffect, useState } from 'react';

import {
  Badge,
  Box,
  Button,
  Heading,
  Skeleton,
  SkeletonText,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';

import { reanalyzeDecision } from '@/actions/analysis';
import { getDecision } from '@/actions/decisions';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog';
import { toaster } from '@/components/ui/toaster';

interface DecisionData {
  id: string;
  situation: string;
  decision: string;
  reasoning: string | null;
  status: string;
  category: string | null;
  biases: string[];
  alternatives: string | null;
  insights: string | null;
  analysisAttempts: number;
  lastAnalyzedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DecisionDetailModalProps {
  decisionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DecisionDetailModal({
  decisionId,
  open,
  onOpenChange,
}: DecisionDetailModalProps) {
  const [decision, setDecision] = useState<DecisionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Fetch decision data when modal opens
  useEffect(() => {
    if (open && decisionId) {
      fetchDecision();
    }
  }, [open, decisionId]);

  // Poll for updates when status is PENDING or PROCESSING
  useEffect(() => {
    if (!isPolling || !decision) return;

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
  }, [decision, isPolling]);

  const fetchDecision = async () => {
    setIsLoading(true);
    const result = await getDecision(decisionId);

    if (result.success && result.data) {
      setDecision(result.data);

      // Start polling if status is PENDING or PROCESSING
      if (
        result.data.status === 'PENDING' ||
        result.data.status === 'PROCESSING'
      ) {
        setIsPolling(true);
      }
    } else {
      toaster.create({
        title: 'Error',
        description: result.error || 'Failed to load decision',
        type: 'error',
        duration: 5000,
      });
      onOpenChange(false);
    }
    setIsLoading(false);
  };

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

  const handleReanalyze = async () => {
    if (!decision) return;

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
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      size="xl"
      scrollBehavior="inside"
      placement="center"
    >
      <DialogContent maxH="90vh">
        <DialogHeader py={6} px={6}>
          <DialogTitle>
            <Stack
              direction="row"
              justify="space-between"
              align="center"
              gap={4}
            >
              <Box fontSize="2xl" fontWeight="bold">
                Decision Details
              </Box>
              {decision && (
                <Badge
                  colorPalette={getStatusColor(decision.status)}
                  size="lg"
                  px={3}
                  py={1}
                >
                  {decision.status}
                </Badge>
              )}
            </Stack>
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody py={6} px={6}>
          {isLoading ? (
            <VStack gap={6} align="stretch">
              {/* Situation skeleton */}
              <Box>
                <Skeleton height="16px" width="80px" mb={3} />
                <SkeletonText noOfLines={3} gap={2} />
              </Box>

              {/* Decision skeleton */}
              <Box>
                <Skeleton height="16px" width="80px" mb={3} />
                <SkeletonText noOfLines={2} gap={2} />
              </Box>

              {/* Reasoning skeleton */}
              <Box>
                <Skeleton height="16px" width="80px" mb={3} />
                <SkeletonText noOfLines={2} gap={2} />
              </Box>

              {/* Created date skeleton */}
              <Box>
                <Skeleton height="16px" width="80px" mb={3} />
                <Skeleton height="20px" width="200px" />
              </Box>
            </VStack>
          ) : decision ? (
            <VStack gap={6} align="stretch">
              {/* Decision Information */}
              <Box>
                <Text
                  fontWeight="bold"
                  mb={3}
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Situation
                </Text>
                <Text whiteSpace="pre-wrap" lineHeight="1.7">
                  {decision.situation}
                </Text>
              </Box>

              <Box>
                <Text
                  fontWeight="bold"
                  mb={3}
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Decision
                </Text>
                <Text whiteSpace="pre-wrap" lineHeight="1.7">
                  {decision.decision}
                </Text>
              </Box>

              {decision.reasoning && (
                <Box>
                  <Text
                    fontWeight="bold"
                    mb={3}
                    fontSize="sm"
                    color="gray.600"
                    _dark={{ color: 'gray.400' }}
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    Reasoning
                  </Text>
                  <Text whiteSpace="pre-wrap" lineHeight="1.7">
                    {decision.reasoning}
                  </Text>
                </Box>
              )}

              <Box>
                <Text
                  fontWeight="bold"
                  mb={3}
                  fontSize="sm"
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Created
                </Text>
                <Text lineHeight="1.7">
                  {new Date(decision.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </Box>

              {/* Analysis Results */}
              {decision.status === 'COMPLETED' && (
                <Box
                  borderTopWidth="1px"
                  pt={6}
                  mt={2}
                  borderColor="gray.200"
                  _dark={{ borderColor: 'gray.700' }}
                >
                  <Heading size="lg" mb={6}>
                    AI Analysis
                  </Heading>

                  <VStack gap={5} align="stretch">
                    {decision.category && (
                      <Box>
                        <Text
                          fontWeight="bold"
                          mb={3}
                          fontSize="sm"
                          color="gray.600"
                          _dark={{ color: 'gray.400' }}
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          Decision Type
                        </Text>
                        <Badge colorPalette="blue" size="lg" px={4} py={2}>
                          {getCategoryLabel(decision.category)}
                        </Badge>
                      </Box>
                    )}

                    {decision.biases && decision.biases.length > 0 && (
                      <Box>
                        <Text
                          fontWeight="bold"
                          mb={3}
                          fontSize="sm"
                          color="gray.600"
                          _dark={{ color: 'gray.400' }}
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          Potential Cognitive Biases
                        </Text>
                        <Stack direction="row" wrap="wrap" gap={2}>
                          {decision.biases.map((bias, index) => (
                            <Badge
                              key={index}
                              colorPalette="orange"
                              px={3}
                              py={1}
                            >
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
                          mb={3}
                          fontSize="sm"
                          color="gray.600"
                          _dark={{ color: 'gray.400' }}
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          Overlooked Alternatives
                        </Text>
                        <Text whiteSpace="pre-wrap" lineHeight="1.7">
                          {decision.alternatives}
                        </Text>
                      </Box>
                    )}

                    {decision.insights && (
                      <Box>
                        <Text
                          fontWeight="bold"
                          mb={3}
                          fontSize="sm"
                          color="gray.600"
                          _dark={{ color: 'gray.400' }}
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          Additional Insights
                        </Text>
                        <Text whiteSpace="pre-wrap" lineHeight="1.7">
                          {decision.insights}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </Box>
              )}

              {/* Processing State */}
              {(decision.status === 'PENDING' ||
                decision.status === 'PROCESSING') && (
                <Box
                  p={8}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="blue.50"
                  _dark={{ bg: 'blue.900/20' }}
                  textAlign="center"
                >
                  <VStack gap={4}>
                    <Text fontWeight="bold" fontSize="lg">
                      Analysis in Progress
                    </Text>
                    <Text
                      color="gray.600"
                      _dark={{ color: 'gray.400' }}
                      lineHeight="1.6"
                    >
                      Your decision is being analyzed by AI. This usually takes
                      a few seconds...
                    </Text>
                  </VStack>
                </Box>
              )}

              {/* Error State */}
              {decision.status === 'FAILED' && (
                <Box
                  p={8}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="red.50"
                  borderColor="red.200"
                  _dark={{ bg: 'red.900/20', borderColor: 'red.800' }}
                >
                  <VStack gap={4}>
                    <Text
                      fontWeight="bold"
                      fontSize="lg"
                      color="red.700"
                      _dark={{ color: 'red.300' }}
                    >
                      Analysis Failed
                    </Text>
                    <Text
                      color="gray.600"
                      _dark={{ color: 'gray.400' }}
                      textAlign="center"
                      lineHeight="1.6"
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
                      size="lg"
                      mt={2}
                    >
                      Retry Analysis
                    </Button>
                  </VStack>
                </Box>
              )}
            </VStack>
          ) : null}
        </DialogBody>

        <DialogFooter py={6} px={6}>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            size="lg"
            px={6}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
