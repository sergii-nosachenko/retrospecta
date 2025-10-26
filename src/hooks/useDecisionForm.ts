import { useCallback, useState } from 'react';

import { analyzeDecision } from '@/actions/analysis';
import { createDecision } from '@/actions/decisions';
import { toaster } from '@/components/ui/toaster';
import { useTranslations } from '@/translations';

interface DecisionFormData {
  situation: string;
  decision: string;
  reasoning: string;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface SubmitResult {
  success: boolean;
  data?: { id: string };
  error?: string;
}

interface UseDecisionFormReturn {
  formData: DecisionFormData;
  isSubmitting: boolean;
  updateField: (field: keyof DecisionFormData, value: string) => void;
  validateField: (field: keyof DecisionFormData) => ValidationResult;
  validateStep: (step: number) => boolean;
  submit: () => Promise<SubmitResult>;
  reset: () => void;
}

/**
 * Custom hook for managing decision form data, validation, and submission
 *
 * Handles all business logic for the decision creation form including:
 * - Form state management
 * - Field-level validation
 * - Step-based validation
 * - Form submission with API integration
 * - Background analysis triggering
 *
 * @returns Form state, validation, and submission handlers
 *
 * @example
 * ```tsx
 * const { formData, updateField, validateStep, submit, reset } = useDecisionForm();
 *
 * // Update a field
 * updateField('situation', 'My decision context');
 *
 * // Validate before moving to next step
 * if (validateStep(0)) {
 *   moveToNextStep();
 * }
 *
 * // Submit the form
 * const result = await submit();
 * ```
 */
export const useDecisionForm = (): UseDecisionFormReturn => {
  const { t } = useTranslations();
  const [formData, setFormData] = useState<DecisionFormData>({
    situation: '',
    decision: '',
    reasoning: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Update a single form field
   */
  const updateField = useCallback(
    (field: keyof DecisionFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  /**
   * Validate a single field and return validation result
   * Does not show toaster messages (for programmatic use)
   */
  const validateField = useCallback(
    (field: keyof DecisionFormData): ValidationResult => {
      const value = formData[field];

      switch (field) {
        case 'situation':
          if (!value.trim()) {
            return {
              isValid: false,
              error: t('decisions.form.validation.situationRequired'),
            };
          }
          if (value.trim().length < 10) {
            return {
              isValid: false,
              error: t('decisions.form.validation.situationMinLength'),
            };
          }
          return { isValid: true };

        case 'decision':
          if (!value.trim()) {
            return {
              isValid: false,
              error: t('decisions.form.validation.decisionRequired'),
            };
          }
          if (value.trim().length < 5) {
            return {
              isValid: false,
              error: t('decisions.form.validation.decisionMinLength'),
            };
          }
          return { isValid: true };

        case 'reasoning':
          // Reasoning is optional, always valid
          return { isValid: true };

        default:
          return { isValid: true };
      }
    },
    [formData, t]
  );

  /**
   * Validate a specific step and show toast messages for errors
   * Returns true if the step is valid, false otherwise
   */
  const validateStep = useCallback(
    (step: number): boolean => {
      let field: keyof DecisionFormData;

      switch (step) {
        case 0:
          field = 'situation';
          break;
        case 1:
          field = 'decision';
          break;
        case 2:
          // Reasoning is optional, always valid
          return true;
        default:
          return true;
      }

      const validation = validateField(field);

      if (!validation.isValid && validation.error) {
        toaster.create({
          title: t('toasts.validation.title'),
          description: validation.error,
          type: 'error',
          duration: 3000,
        });
        return false;
      }

      return true;
    },
    [validateField, t]
  );

  /**
   * Submit the form to create a decision
   * Validates all required fields, creates the decision, and triggers background analysis
   */
  const submit = useCallback(async (): Promise<SubmitResult> => {
    // Validate all required fields
    if (!formData.situation.trim() || !formData.decision.trim()) {
      toaster.create({
        title: t('toasts.validation.title'),
        description: t('decisions.form.validation.allFieldsRequired'),
        type: 'error',
        duration: 4000,
      });
      return { success: false, error: 'Validation failed' };
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
        const errorMessage = result.error ?? t('toasts.errors.createDecision');

        toaster.create({
          title: t('toasts.error.title'),
          description: errorMessage,
          type: 'error',
          duration: 5000,
        });

        return { success: false, error: errorMessage };
      }

      // Show success message
      toaster.create({
        title: t('toasts.success.decisionCreated.title'),
        description: t('toasts.success.decisionCreated.description'),
        type: 'success',
        duration: 3000,
      });

      // Trigger analysis in the background (non-blocking)
      // The SSE connection will automatically update the UI
      analyzeDecision(result.data.id).catch((error) => {
        console.error('Background analysis error:', error);
      });

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error submitting decision:', error);

      const errorMessage = t('toasts.errors.tryAgain');

      toaster.create({
        title: t('toasts.error.title'),
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, t]);

  /**
   * Reset the form to its initial state
   */
  const reset = useCallback(() => {
    setFormData({
      situation: '',
      decision: '',
      reasoning: '',
    });
    setIsSubmitting(false);
  }, []);

  return {
    formData,
    isSubmitting,
    updateField,
    validateField,
    validateStep,
    submit,
    reset,
  };
};
