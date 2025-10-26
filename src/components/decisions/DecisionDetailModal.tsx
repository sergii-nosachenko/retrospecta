'use client';

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
import { useCallback, useEffect, useState } from 'react';


import { reanalyzeDecision } from '@/actions/analysis';
import { deleteDecision, getDecision } from '@/actions/decisions';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { toaster } from '@/components/ui/toaster';
import {
  getDecisionTypeIcon,
  getDecisionTypeLabel,
  getStatusLabel,
} from '@/constants/decisions';
import { useDecisions } from '@/contexts/DecisionsContext';
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

interface DecisionDetailModalProps {
  decisionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export const DecisionDetailModal = ({
  decisionId,
  open,
  onOpenChange,
}: DecisionDetailModalProps) => {
  const { t } = useTranslations();
  const {
    optimisticUpdateStatus,
    optimisticDelete,
    getDecision: getDecisionFromContext,
  } = useDecisions();
  const [decision, setDecision] = useState<DecisionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDecision = useCallback(async () => {
    setIsLoading(true);

    // Get decision from context (instant, no API call needed!)
    const contextDecision = getDecisionFromContext(decisionId);

    if (contextDecision) {
      // Context has all the fields we need
      const decisionData: DecisionData = {
        ...contextDecision,
        analysisAttempts: contextDecision.analysisAttempts ?? 0,
        lastAnalyzedAt: contextDecision.lastAnalyzedAt ?? null,
        errorMessage: contextDecision.errorMessage ?? null,
      };

      setDecision(decisionData);

      // Start polling if status is PENDING or PROCESSING
      if (
        contextDecision.status === ProcessingStatus.PENDING ||
        contextDecision.status === ProcessingStatus.PROCESSING
      ) {
        setIsPolling(true);
      }

      setIsLoading(false);
    } else {
      // Fallback: decision not in context yet (shouldn't happen normally)
      const result = await getDecision(decisionId);

      if (result.success && result.data) {
        setDecision(result.data);

        // Start polling if status is PENDING or PROCESSING
        if (
          result.data.status === ProcessingStatus.PENDING ||
          result.data.status === ProcessingStatus.PROCESSING
        ) {
          setIsPolling(true);
        }
      } else {
        toaster.create({
          title: t('toasts.error.title'),
          description: result.error ?? t('toasts.errors.loadDecision'),
          type: 'error',
          duration: 5000,
        });
        onOpenChange(false);
      }
      setIsLoading(false);
    }
  }, [decisionId, onOpenChange, getDecisionFromContext, t]);

  // Reset state when modal closes or decisionId changes
  useEffect(() => {
    if (!open) {
      // Reset all state when modal closes
      setDecision(null);
      setIsLoading(true);
      setIsPolling(false);
      setIsReanalyzing(false);
    }
  }, [open]);

  // Fetch decision data when modal opens
  useEffect(() => {
    if (open && decisionId) {
      // Reset state when opening a new decision
      setIsReanalyzing(false);
      setIsPolling(false);
      void fetchDecision();
    }
  }, [open, decisionId, fetchDecision]);

  // Poll for updates when status is PENDING or PROCESSING
  // Uses context data (updated by SSE) instead of making API calls
  useEffect(() => {
    if (!isPolling || !decision) return;

    const interval = setInterval(() => {
      // Get updated decision from context (no API call)
      const updatedDecision = getDecisionFromContext(decision.id);

      if (updatedDecision) {
        // Update local state with context data
        setDecision((prev) => ({
          ...prev!,
          ...updatedDecision,
        }));

        // Stop polling if analysis is complete or failed
        if (
          updatedDecision.status === ProcessingStatus.COMPLETED ||
          updatedDecision.status === ProcessingStatus.FAILED
        ) {
          setIsPolling(false);

          // Fetch full details one last time to get error message if failed
          if (updatedDecision.status === ProcessingStatus.FAILED) {
            void getDecision(decision.id).then((result) => {
              if (result.success && result.data) {
                setDecision(result.data);
              }
            });
          }
        }
      }
    }, 1000); // Check context every second (no API call, very cheap)

    return () => clearInterval(interval);
  }, [decision, isPolling, getDecisionFromContext]);

  const handleReanalyze = useCallback(async () => {
    if (!decision) return;

    setIsReanalyzing(true);

    try {
      // Optimistically update status immediately for instant UI feedback
      optimisticUpdateStatus(decision.id, ProcessingStatus.PROCESSING);

      // Update local modal state immediately
      setDecision((prev) =>
        prev ? { ...prev, status: ProcessingStatus.PROCESSING } : null
      );
      setIsPolling(true);

      const result = await reanalyzeDecision(decision.id);

      if (result.success) {
        // Show brief success notification
        toaster.create({
          title: t('toasts.success.reAnalysisStarted.title'),
          description: t('toasts.success.reAnalysisStarted.description'),
          type: 'info',
          duration: 2000,
        });

        // No need to refresh - SSE will automatically pick up changes within 3 seconds
        // Optimistic update already provides instant UI feedback
      } else {
        // Revert optimistic update on error
        optimisticUpdateStatus(decision.id, ProcessingStatus.COMPLETED);
        setDecision((prev) =>
          prev ? { ...prev, status: ProcessingStatus.COMPLETED } : null
        );
        setIsPolling(false);

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
      optimisticUpdateStatus(decision.id, ProcessingStatus.COMPLETED);
      setDecision((prev) =>
        prev ? { ...prev, status: ProcessingStatus.COMPLETED } : null
      );
      setIsPolling(false);

      toaster.create({
        title: t('toasts.error.title'),
        description: t('toasts.errors.unexpected'),
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsReanalyzing(false);
    }
  }, [decision, optimisticUpdateStatus, t]);

  const handleDelete = useCallback(async () => {
    if (!decision) return;

    setIsDeleting(true);

    try {
      // Close modal first
      onOpenChange(false);

      // Optimistically remove decision immediately for instant UI feedback
      optimisticDelete(decision.id);

      const result = await deleteDecision(decision.id);

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
    } finally {
      setIsDeleting(false);
    }
  }, [decision, onOpenChange, optimisticDelete, t]);

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      size={{ base: 'full', sm: 'lg', md: 'xl' }}
      scrollBehavior="inside"
      placement="center"
    >
      <DialogContent
        h={{ base: 'auto', smDown: 'fit-content' }}
        maxH={{ base: '90dvh', smDown: '100dvh' }}
        minH={{ base: 'auto', smDown: '100dvh' }}
      >
        <DialogHeader py={{ base: 3, md: 4 }} px={{ base: 4, md: 6 }}>
          <DialogTitle>
            <Stack
              direction="row"
              justify="space-between"
              align="center"
              gap={4}
            >
              <Box fontSize="2xl" fontWeight="bold">
                {t('decisions.detail.title')}
              </Box>
              {decision && (
                <Badge
                  colorPalette={getStatusColor(decision.status)}
                  size="lg"
                  px={3}
                  py={1}
                >
                  {getStatusLabel(t, decision.status)}
                </Badge>
              )}
            </Stack>
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody py={{ base: 3, md: 4 }} px={{ base: 4, md: 6 }}>
          {isLoading ? (
            <VStack gap={4} align="stretch">
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
            <VStack gap={4} align="stretch">
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
                  {t('decisions.detail.sections.situation')}
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
                  {t('decisions.detail.sections.decision')}
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
                    {t('decisions.detail.sections.reasoning')}
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
                  {t('decisions.detail.sections.created')}
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
              {decision.status === ProcessingStatus.COMPLETED && (
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
                          {t('decisions.detail.sections.decisionType')}
                        </Text>
                        <Badge colorPalette="blue" size="lg" px={4} py={2}>
                          <Stack direction="row" align="center" gap={1.5}>
                            {getDecisionTypeIcon(decision.decisionType)}
                            <span>
                              {getDecisionTypeLabel(t, decision.decisionType)}
                            </span>
                          </Stack>
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
                          {t('decisions.detail.sections.biases')}
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
                          {t('decisions.detail.sections.alternatives')}
                        </Text>
                        <MarkdownRenderer content={decision.alternatives} />
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
                          {t('decisions.detail.sections.insights')}
                        </Text>
                        <MarkdownRenderer content={decision.insights} />
                      </Box>
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
                              {new Date(
                                decision.lastAnalyzedAt
                              ).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </>
                          )}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </Box>
              )}

              {/* Processing State */}
              {(decision.status === ProcessingStatus.PENDING ||
                decision.status === ProcessingStatus.PROCESSING) && (
                <Box
                  px={6}
                  py={5}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="blue.50"
                  _dark={{ bg: 'blue.900/20' }}
                  textAlign="center"
                >
                  <VStack gap={3}>
                    <Text fontWeight="bold" fontSize="lg">
                      {t('decisions.detail.states.analyzing.title')}
                    </Text>
                    <Text
                      color="gray.600"
                      _dark={{ color: 'gray.400' }}
                      lineHeight="1.6"
                      px={2}
                    >
                      {t('decisions.detail.states.analyzing.description')}
                    </Text>
                  </VStack>
                </Box>
              )}

              {/* Error State */}
              {decision.status === ProcessingStatus.FAILED && (
                <Box
                  px={6}
                  py={5}
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
                      {t('decisions.detail.states.failed.title')}
                    </Text>
                    <Text
                      color="gray.600"
                      _dark={{ color: 'gray.400' }}
                      textAlign="center"
                      lineHeight="1.6"
                      px={2}
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
                      size="lg"
                    >
                      {t('decisions.detail.states.failed.retry')}
                    </Button>
                  </VStack>
                </Box>
              )}
            </VStack>
          ) : null}
        </DialogBody>

        <DialogFooter
          py={{ base: 3, md: 4 }}
          px={{ base: 4, md: 6 }}
          pb={{ base: 'max(1rem, env(safe-area-inset-bottom))', md: 4 }}
        >
          <Stack
            direction="row"
            justify="space-between"
            align="center"
            width="100%"
          >
            <Button
              colorPalette="red"
              variant="ghost"
              onClick={handleDelete}
              loading={isDeleting}
              loadingText={t('common.actions.delete')}
              size="lg"
              px={6}
            >
              {t('common.actions.delete')}
            </Button>
            {decision?.status === ProcessingStatus.COMPLETED && (
              <Button
                colorPalette="blue"
                variant="outline"
                onClick={handleReanalyze}
                loading={isReanalyzing}
                loadingText={t('decisions.list.actions.reAnalyze')}
                size="lg"
                px={6}
              >
                {t('decisions.list.actions.reAnalyze')}
              </Button>
            )}
          </Stack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

DecisionDetailModal.displayName = 'DecisionDetailModal';
