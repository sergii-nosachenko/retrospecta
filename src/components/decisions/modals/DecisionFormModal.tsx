'use client';

import { Button, Text, VStack } from '@chakra-ui/react';
import { useCallback, useMemo, useState } from 'react';

import { BaseModal } from '@/components/common';
import { StepsItem, StepsList, StepsRoot } from '@/components/ui/steps';
import { useDecisionForm } from '@/hooks/useDecisionForm';
import { useMultiStepForm } from '@/hooks/useMultiStepForm';
import { useTranslations } from '@/translations';

import { DecisionFormStep1 } from '../form/DecisionFormStep1';
import { DecisionFormStep2 } from '../form/DecisionFormStep2';
import { DecisionFormStep3 } from '../form/DecisionFormStep3';
import { FormNavigation } from '../form/FormNavigation';

interface DecisionFormModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

/**
 * Multi-step modal for creating a new decision
 *
 * Guides users through a 3-step process to create a decision:
 * 1. Situation - Context and background
 * 2. Decision - The actual decision made
 * 3. Reasoning - Optional additional context
 *
 * After submission, the decision is created and analysis is triggered
 * automatically in the background via SSE.
 *
 * @param trigger - Optional custom trigger element (defaults to "New Decision" button)
 * @param onSuccess - Optional callback invoked after successful submission
 */
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
   * Handle cancel button click
   */
  const handleCancel = useCallback(() => {
    setOpen(false);
  }, []);

  /**
   * Prevent form auto-submit on Enter key
   */
  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);

  /**
   * Generic field change handler
   */
  const createChangeHandler = useCallback(
    (field: 'situation' | 'decision' | 'reasoning') =>
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateField(field, e.target.value);
      },
    [updateField]
  );

  return (
    <BaseModal
      open={open}
      onOpenChange={(isOpen) => handleOpenChange({ open: isOpen })}
      title={t('decisions.form.title')}
      paddingVariant="comfortable"
      trigger={
        trigger ?? (
          <Button colorPalette="blue" size="sm" px={4} py={2}>
            {t('decisions.form.actions.newDecision')}
          </Button>
        )
      }
      footer={
        <FormNavigation
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isSubmitting={isSubmitting}
          onPrevious={previous}
          onNext={handleNext}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      }
    >
      <form onSubmit={handleFormSubmit} style={{ display: 'contents' }}>
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

            <DecisionFormStep1
              value={formData.situation}
              onChange={createChangeHandler('situation')}
              disabled={isSubmitting}
            />

            <DecisionFormStep2
              value={formData.decision}
              onChange={createChangeHandler('decision')}
              disabled={isSubmitting}
            />

            <DecisionFormStep3
              value={formData.reasoning}
              onChange={createChangeHandler('reasoning')}
              disabled={isSubmitting}
            />
          </StepsRoot>
        </VStack>
      </form>
    </BaseModal>
  );
};

DecisionFormModal.displayName = 'DecisionFormModal';
