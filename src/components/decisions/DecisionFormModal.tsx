'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Button,
  Heading,
  Stack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';

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
import { toaster } from '@/components/ui/toaster';

interface DecisionFormModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function DecisionFormModal({
  trigger,
  onSuccess,
}: DecisionFormModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    situation: '',
    decision: '',
    reasoning: '',
  });

  const resetForm = () => {
    setFormData({
      situation: '',
      decision: '',
      reasoning: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.situation.trim() || !formData.decision.trim()) {
      toaster.create({
        title: 'Validation Error',
        description: 'Please fill in both situation and decision fields',
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
      size="xl"
      placement="center"
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button colorPalette="blue" size="sm" px={4} py={2}>
            New Decision
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader py={6} px={6}>
            <DialogTitle fontSize="2xl" fontWeight="bold">
              Record a Decision
            </DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>

          <DialogBody py={6} px={6}>
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

              <Field
                label="Situation"
                required
                helperText="Describe the situation that led to your decision (min 10 characters)"
              >
                <Textarea
                  placeholder="Example: I was choosing between two job offers - one with a higher salary but longer commute, and another with better work-life balance..."
                  value={formData.situation}
                  onChange={(e) =>
                    setFormData({ ...formData, situation: e.target.value })
                  }
                  rows={3}
                  minH="60px"
                  disabled={isSubmitting}
                  maxLength={5000}
                  p={3}
                />
              </Field>

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
                  rows={2}
                  minH="60px"
                  disabled={isSubmitting}
                  maxLength={2000}
                  p={3}
                />
              </Field>

              <Field
                label="Reasoning (Optional)"
                helperText="Why did you make this decision? What factors influenced you?"
              >
                <Textarea
                  placeholder="Example: I realized that my mental health and time with family were more important than a higher salary..."
                  value={formData.reasoning}
                  onChange={(e) =>
                    setFormData({ ...formData, reasoning: e.target.value })
                  }
                  rows={2}
                  minH="60px"
                  disabled={isSubmitting}
                  maxLength={3000}
                  p={3}
                />
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter py={6} px={6}>
            <Stack direction="row" gap={3} width="full">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                flex={1}
                size="lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorPalette="blue"
                loading={isSubmitting}
                loadingText="Creating..."
                flex={1}
                size="lg"
              >
                Create Decision
              </Button>
            </Stack>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
