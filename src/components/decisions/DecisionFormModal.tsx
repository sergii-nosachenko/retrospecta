'use client';

import { Button, Stack, Text, Textarea, VStack } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';

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
import { useDecisionForm } from '@/hooks/useDecisionForm';
import { useMultiStepForm } from '@/hooks/useMultiStepForm';
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

  // Define form steps
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

  // Use custom hooks for form logic
  const {
    currentStep,
    isFirstStep,
    isLastStep,
    next,
    previous,
    reset: resetStep,
  } = useMultiStepForm({ steps });

  const {
    formData,
    isSubmitting,
    updateField,
    validateStep,
    submit,
    reset: resetForm,
  } = useDecisionForm();

  /**
   * Reset both form and step state
   */
  const resetAll = useCallback(() => {
    resetForm();
    resetStep();
  }, [resetForm, resetStep]);

  /**
   * Handle next button click with validation
   */
  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      next();
    }
  }, [currentStep, validateStep, next]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    const result = await submit();

    if (result.success) {
      // Close modal and reset form
      setOpen(false);
      resetAll();

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [submit, resetAll, onSuccess]);

  /**
   * Handle modal open/close state changes
   */
  const handleOpenChange = useCallback(
    (e: { open: boolean }) => {
      setOpen(e.open);
      if (!e.open) {
        resetAll();
      }
    },
    [resetAll]
  );

  /**
   * Prevent form auto-submit on Enter key
   */
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);

  /**
   * Handle field change events
   */
  const handleSituationChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateField('situation', e.target.value);
    },
    [updateField]
  );

  const handleDecisionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateField('decision', e.target.value);
    },
    [updateField]
  );

  const handleReasoningChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateField('reasoning', e.target.value);
    },
    [updateField]
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
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    onClick={previous}
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
                {isLastStep ? (
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
                ) : (
                  <Button
                    onClick={handleNext}
                    colorPalette="blue"
                    disabled={isSubmitting}
                    size="lg"
                    px={6}
                  >
                    {t('common.actions.next')}
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
