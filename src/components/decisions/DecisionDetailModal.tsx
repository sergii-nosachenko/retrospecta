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
import {
  getBiasLabel,
  getDecisionTypeIcon,
  getDecisionTypeLabel,
  getStatusLabel,
} from '@/constants/decisions';
import { useDecisionActions } from '@/hooks/useDecisionActions';
import { useDecisionPolling } from '@/hooks/useDecisionPolling';
import { useTranslations } from '@/translations';
import { ProcessingStatus } from '@/types/enums';

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

  // Use the polling hook to manage decision state and updates
  const { decision, isLoading } = useDecisionPolling({
    decisionId,
    enabled: open,
    source: 'context', // Use context-based polling (more efficient)
  });

  // Use the actions hook to manage reanalyze and delete actions
  const { handleReanalyze, handleDelete, isReanalyzing, isDeleting } =
    useDecisionActions(decision);

  // Wrap handleDelete to close modal on completion
  const handleDeleteWithClose = () => {
    void handleDelete(() => onOpenChange(false));
  };

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
                              {getBiasLabel(t, bias)}
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
              onClick={handleDeleteWithClose}
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
