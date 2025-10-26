'use client';

import { Button, Stack, Text, Textarea, VStack } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';


import { analyzeDecision } from '@/actions/analysis';
import { createDecision } from '@/actions/decisions';
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import {
  StepsContent,
  StepsItem,
  StepsList,
  StepsRoot,
} from '@/components/ui/steps';
import { toaster } from '@/components/ui/toaster';
import { useTranslations } from '@/translations';

interface DecisionFormModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const DecisionFormModal = ({
  trigger,
  onSuccess,
}: DecisionFormModalProps) => {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    situation: '',
    decision: '',
    reasoning: '',
  });

  const steps = useMemo(
    () => [
      {
        title: t('decisions.form.steps.situation'),
        description: t('decisions.form.fields.situation.modalPlaceholder'),
      },
      {
        title: t('decisions.form.steps.decision'),
        description: t('decisions.form.fields.decision.modalPlaceholder'),
      },
      {
        title: t('decisions.form.steps.reasoning'),
        description: t('decisions.form.fields.reasoning.modalPlaceholder'),
      },
    ],
    [t]
  );

  const resetForm = useCallback(() => {
    setFormData({
      situation: '',
      decision: '',
      reasoning: '',
    });
    setCurrentStep(0);
  }, []);

  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 0: // Situation
        if (!formData.situation.trim()) {
          toaster.create({
            title: t('toasts.validation.title'),
            description: t('decisions.form.validation.situationRequired'),
            type: 'error',
            duration: 3000,
          });
          return false;
        }
        if (formData.situation.trim().length < 10) {
          toaster.create({
            title: t('toasts.validation.title'),
            description: t('decisions.form.validation.situationMinLength'),
            type: 'error',
            duration: 3000,
          });
          return false;
        }
        return true;
      case 1: // Decision
        if (!formData.decision.trim()) {
          toaster.create({
            title: t('toasts.validation.title'),
            description: t('decisions.form.validation.decisionRequired'),
            type: 'error',
            duration: 3000,
          });
          return false;
        }
        if (formData.decision.trim().length < 5) {
          toaster.create({
            title: t('toasts.validation.title'),
            description: t('decisions.form.validation.decisionMinLength'),
            type: 'error',
            duration: 3000,
          });
          return false;
        }
        return true;
      case 2: // Reasoning (optional)
        return true;
      default:
        return true;
    }
  }, [currentStep, formData, t]);

  const handleNext = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  }, [steps.length, validateCurrentStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Prevent auto-submit, only allow manual button click
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validate all steps before submission
    if (!formData.situation.trim() || !formData.decision.trim()) {
      toaster.create({
        title: t('toasts.validation.title'),
        description: t('decisions.form.validation.allFieldsRequired'),
        type: 'error',
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create decision
      const result = await createDecision({
        situation: formData.situation,
        decision: formData.decision,
        reasoning: formData.reasoning || undefined,
      });

      if (!result.success || !result.data) {
        toaster.create({
          title: t('toasts.error.title'),
          description: result.error ?? t('toasts.errors.createDecision'),
          type: 'error',
          duration: 5000,
        });
        return;
      }

      // Show success message
      toaster.create({
        title: t('toasts.success.decisionCreated.title'),
        description: t('toasts.success.decisionCreated.description'),
        type: 'success',
        duration: 3000,
      });

      // Close modal and reset form
      setOpen(false);
      resetForm();

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Trigger analysis in the background (non-blocking)
      // The SSE connection will automatically update the UI
      analyzeDecision(result.data.id).catch((error) => {
        console.error('Background analysis error:', error);
      });
    } catch (error) {
      console.error('Error submitting decision:', error);
      toaster.create({
        title: t('toasts.error.title'),
        description: t('toasts.errors.tryAgain'),
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSuccess, resetForm, t]);

  const handleOpenChange = useCallback(
    (e: { open: boolean }) => {
      setOpen(e.open);
      if (!e.open) {
        resetForm();
      }
    },
    [resetForm]
  );

  const handleSituationChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, situation: e.target.value }));
    },
    []
  );

  const handleDecisionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, decision: e.target.value }));
    },
    []
  );

  const handleReasoningChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, reasoning: e.target.value }));
    },
    []
  );

  const handleCloseClick = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <DialogRoot
      open={open}
      onOpenChange={handleOpenChange}
      size={{ base: 'full', sm: 'lg', md: 'xl' }}
      scrollBehavior="inside"
      placement="center"
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button colorPalette="blue" size="sm" px={4} py={2}>
            {t('decisions.form.actions.newDecision')}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        h={{ base: 'auto', smDown: 'fit-content' }}
        maxH={{ base: '90dvh', smDown: '100dvh' }}
        minH={{ base: 'auto', smDown: '100dvh' }}
      >
        <DialogHeader py={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
          <DialogTitle fontSize="2xl" fontWeight="bold">
            {t('decisions.form.title')}
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <form onSubmit={handleFormSubmit} style={{ display: 'contents' }}>
          <DialogBody py={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
            <VStack gap={6} align="stretch">
              <Text
                color="gray.600"
                _dark={{ color: 'gray.400' }}
                fontSize="md"
                lineHeight="1.6"
              >
                {t('decisions.form.description')}
              </Text>

              <StepsRoot
                step={currentStep}
                count={steps.length}
                orientation="horizontal"
                size="sm"
              >
                <StepsList mb={6}>
                  {steps.map((step, index) => (
                    <StepsItem
                      key={index}
                      index={index}
                      title={step.title}
                      description={step.description}
                    />
                  ))}
                </StepsList>

                {/* Step 0: Situation */}
                <StepsContent index={0}>
                  <VStack gap={4} align="stretch">
                    <Field
                      label={t('decisions.form.fields.situation.label')}
                      required
                      helperText={t(
                        'decisions.form.fields.situation.placeholder'
                      )}
                    >
                      <Textarea
                        placeholder={t(
                          'decisions.form.fields.situation.example'
                        )}
                        value={formData.situation}
                        onChange={handleSituationChange}
                        rows={6}
                        minH="150px"
                        maxH="150px"
                        disabled={isSubmitting}
                        maxLength={5000}
                        p={3}
                        autoFocus
                      />
                    </Field>
                  </VStack>
                </StepsContent>

                {/* Step 1: Decision */}
                <StepsContent index={1}>
                  <VStack gap={4} align="stretch">
                    <Field
                      label={t('decisions.form.fields.decision.label')}
                      required
                      helperText={t(
                        'decisions.form.fields.decision.placeholder'
                      )}
                    >
                      <Textarea
                        placeholder={t(
                          'decisions.form.fields.decision.example'
                        )}
                        value={formData.decision}
                        onChange={handleDecisionChange}
                        rows={6}
                        minH="150px"
                        maxH="150px"
                        disabled={isSubmitting}
                        maxLength={2000}
                        p={3}
                        autoFocus
                      />
                    </Field>
                  </VStack>
                </StepsContent>

                {/* Step 2: Reasoning */}
                <StepsContent index={2}>
                  <VStack gap={4} align="stretch">
                    <Field
                      label={t('decisions.form.fields.reasoning.label')}
                      helperText={t(
                        'decisions.form.fields.reasoning.placeholder'
                      )}
                    >
                      <Textarea
                        placeholder={t(
                          'decisions.form.fields.reasoning.example'
                        )}
                        value={formData.reasoning}
                        onChange={handleReasoningChange}
                        rows={6}
                        minH="150px"
                        maxH="150px"
                        disabled={isSubmitting}
                        maxLength={3000}
                        p={3}
                        autoFocus
                      />
                    </Field>
                  </VStack>
                </StepsContent>
              </StepsRoot>
            </VStack>
          </DialogBody>

          <DialogFooter
            py={{ base: 4, md: 6 }}
            px={{ base: 4, md: 6 }}
            pb={{ base: 'max(1rem, env(safe-area-inset-bottom))', md: 6 }}
          >
            <Stack
              direction="row"
              gap={3}
              width="full"
              justifyContent="space-between"
            >
              <Stack direction="row" gap={3}>
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isSubmitting}
                    size="lg"
                    px={6}
                  >
                    {t('common.actions.previous')}
                  </Button>
                )}
              </Stack>

              <Stack direction="row" gap={3}>
                <Button
                  variant="outline"
                  onClick={handleCloseClick}
                  disabled={isSubmitting}
                  size="lg"
                  px={6}
                >
                  {t('common.actions.cancel')}
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    colorPalette="blue"
                    disabled={isSubmitting}
                    size="lg"
                    px={6}
                  >
                    {t('common.actions.next')}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    colorPalette="blue"
                    loading={isSubmitting}
                    loadingText={t('common.actions.creating')}
                    size="lg"
                    px={6}
                  >
                    {t('decisions.form.actions.create')}
                  </Button>
                )}
              </Stack>
            </Stack>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
};

DecisionFormModal.displayName = 'DecisionFormModal';
