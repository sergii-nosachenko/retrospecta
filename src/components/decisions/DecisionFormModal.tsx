'use client';

import { useState } from 'react';

import { Button, Stack, Text, Textarea, VStack } from '@chakra-ui/react';

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

interface DecisionFormModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function DecisionFormModal({
  trigger,
  onSuccess,
}: DecisionFormModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    situation: '',
    decision: '',
    reasoning: '',
  });

  const steps = [
    { title: 'Situation', description: 'Describe the context' },
    { title: 'Decision', description: 'What did you decide?' },
    { title: 'Reasoning', description: 'Why this choice?' },
  ];

  const resetForm = () => {
    setFormData({
      situation: '',
      decision: '',
      reasoning: '',
    });
    setCurrentStep(0);
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Situation
        if (!formData.situation.trim()) {
          toaster.create({
            title: 'Validation Error',
            description: 'Please describe the situation',
            type: 'error',
            duration: 3000,
          });
          return false;
        }
        if (formData.situation.trim().length < 10) {
          toaster.create({
            title: 'Validation Error',
            description: 'Situation must be at least 10 characters',
            type: 'error',
            duration: 3000,
          });
          return false;
        }
        return true;
      case 1: // Decision
        if (!formData.decision.trim()) {
          toaster.create({
            title: 'Validation Error',
            description: 'Please describe your decision',
            type: 'error',
            duration: 3000,
          });
          return false;
        }
        if (formData.decision.trim().length < 5) {
          toaster.create({
            title: 'Validation Error',
            description: 'Decision must be at least 5 characters',
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
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent auto-submit, only allow manual button click
  };

  const handleSubmit = async () => {
    // Validate all steps before submission
    if (!formData.situation.trim() || !formData.decision.trim()) {
      toaster.create({
        title: 'Validation Error',
        description: 'Please complete all required fields',
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
          title: 'Error',
          description: result.error || 'Failed to create decision',
          type: 'error',
          duration: 5000,
        });
        return;
      }

      // Show success message
      toaster.create({
        title: 'Decision Created',
        description: 'Your decision has been saved and is being analyzed...',
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
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => {
        setOpen(e.open);
        if (!e.open) {
          resetForm();
        }
      }}
      size={{ base: 'full', sm: 'lg', md: 'xl' }}
      scrollBehavior="inside"
      placement="center"
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button colorPalette="blue" size="sm" px={4} py={2}>
            New Decision
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
            Record a Decision
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
                Describe your decision and receive AI-powered insights about
                your decision-making process
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
                      label="Situation"
                      required
                      helperText="Describe the situation that led to your decision (min 10 characters)"
                    >
                      <Textarea
                        placeholder="Example: I was choosing between two job offers - one with a higher salary but longer commute, and another with better work-life balance..."
                        value={formData.situation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            situation: e.target.value,
                          })
                        }
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
                      label="Decision"
                      required
                      helperText="What did you decide to do? (min 5 characters)"
                    >
                      <Textarea
                        placeholder="Example: I chose the job with better work-life balance despite the lower salary..."
                        value={formData.decision}
                        onChange={(e) =>
                          setFormData({ ...formData, decision: e.target.value })
                        }
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
                      label="Reasoning (Optional)"
                      helperText="Why did you make this decision? What factors influenced you?"
                    >
                      <Textarea
                        placeholder="Example: I realized that my mental health and time with family were more important than a higher salary..."
                        value={formData.reasoning}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            reasoning: e.target.value,
                          })
                        }
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
                    Previous
                  </Button>
                )}
              </Stack>

              <Stack direction="row" gap={3}>
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                  size="lg"
                  px={6}
                >
                  Cancel
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    colorPalette="blue"
                    disabled={isSubmitting}
                    size="lg"
                    px={6}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    colorPalette="blue"
                    loading={isSubmitting}
                    loadingText="Creating..."
                    size="lg"
                    px={6}
                  >
                    Create Decision
                  </Button>
                )}
              </Stack>
            </Stack>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
