'use client';

import { Button, Stack } from '@chakra-ui/react';

import { useTranslations } from '@/translations';

interface FormNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

/**
 * Navigation controls for multi-step form
 *
 * Displays Previous, Cancel, Next, and Create buttons with appropriate
 * visibility and state based on the current step and submission status.
 *
 * @param isFirstStep - Whether we're on the first step (hides Previous button)
 * @param isLastStep - Whether we're on the last step (shows Create instead of Next)
 * @param isSubmitting - Whether form is currently being submitted
 * @param onPrevious - Handler for Previous button click
 * @param onNext - Handler for Next button click
 * @param onCancel - Handler for Cancel button click
 * @param onSubmit - Handler for Create button click
 */
export const FormNavigation = ({
  isFirstStep,
  isLastStep,
  isSubmitting,
  onPrevious,
  onNext,
  onCancel,
  onSubmit,
}: FormNavigationProps) => {
  const { t } = useTranslations();

  return (
    <Stack direction="row" gap={3} width="full" justifyContent="space-between">
      <Stack direction="row" gap={3}>
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={onPrevious}
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
          onClick={onCancel}
          disabled={isSubmitting}
          size="lg"
          px={6}
        >
          {t('common.actions.cancel')}
        </Button>
        {isLastStep ? (
          <Button
            onClick={onSubmit}
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
            onClick={onNext}
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
  );
};

FormNavigation.displayName = 'FormNavigation';
