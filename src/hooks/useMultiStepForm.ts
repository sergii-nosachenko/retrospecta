import { useCallback, useState } from 'react';

interface Step {
  title: string;
  description: string;
}

interface UseMultiStepFormOptions {
  steps: Step[];
  initialStep?: number;
}

interface UseMultiStepFormReturn {
  currentStep: number;
  steps: Step[];
  isFirstStep: boolean;
  isLastStep: boolean;
  next: () => void;
  previous: () => void;
  goTo: (step: number) => void;
  reset: () => void;
}

/**
 * Custom hook for managing multi-step form navigation
 *
 * Provides utilities for navigating between form steps, tracking current position,
 * and resetting to initial state.
 *
 * @param options - Configuration options
 * @returns Multi-step form navigation state and controls
 *
 * @example
 * ```tsx
 * const { currentStep, next, previous, isFirstStep, isLastStep } = useMultiStepForm({
 *   steps: [
 *     { title: 'Step 1', description: 'First step' },
 *     { title: 'Step 2', description: 'Second step' },
 *   ],
 * });
 * ```
 */
export const useMultiStepForm = ({
  steps,
  initialStep = 0,
}: UseMultiStepFormOptions): UseMultiStepFormReturn => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const next = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const previous = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  /**
   * @param step - The step index to navigate to (0-based)
   */
  const goTo = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
      }
    },
    [steps.length]
  );

  const reset = useCallback(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  return {
    currentStep,
    steps,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    next,
    previous,
    goTo,
    reset,
  };
};
