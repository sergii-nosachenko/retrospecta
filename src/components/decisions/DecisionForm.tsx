'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';

import { analyzeDecision } from '@/actions/analysis';
import { createDecision } from '@/actions/decisions';
import { Field } from '@/components/ui/field';
import { toaster } from '@/components/ui/toaster';

export function DecisionForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    situation: '',
    decision: '',
    reasoning: '',
  });

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

      // Trigger analysis in the background (non-blocking)
      analyzeDecision(result.data.id).catch((error) => {
        console.error('Background analysis error:', error);
      });

      // Redirect to decision detail page
      router.push(`/decisions/${result.data.id}`);
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
    <Box
      as="form"
      onSubmit={handleSubmit}
      maxW="3xl"
      mx="auto"
      p={{ base: 4, md: 8 }}
    >
      <VStack gap={6} align="stretch">
        <Box>
          <Heading size="2xl" mb={2}>
            Record a Decision
          </Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            Describe your decision and receive AI-powered insights about your
            decision-making process
          </Text>
        </Box>

        <Stack gap={6}>
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
              rows={5}
              disabled={isSubmitting}
              maxLength={5000}
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
              rows={4}
              disabled={isSubmitting}
              maxLength={2000}
            />
          </Field>

          <Field
            label="Reasoning (Optional)"
            helperText="Why did you make this decision? What factors influenced you?"
          >
            <Textarea
              placeholder="Example: I realized that my mental health and time with family were more important than a higher salary. The commute would have added 2 hours to my day..."
              value={formData.reasoning}
              onChange={(e) =>
                setFormData({ ...formData, reasoning: e.target.value })
              }
              rows={4}
              disabled={isSubmitting}
              maxLength={3000}
            />
          </Field>
        </Stack>

        <Stack direction={{ base: 'column', sm: 'row' }} gap={3}>
          <Button
            type="submit"
            colorPalette="blue"
            size="lg"
            loading={isSubmitting}
            loadingText="Creating..."
            flex={1}
          >
            Create Decision
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
}
