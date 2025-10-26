'use client';

import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';



import { analyzeDecision } from '@/actions/analysis';
import { createDecision } from '@/actions/decisions';
import { Field } from '@/components/ui/field';
import { toaster } from '@/components/ui/toaster';
import { useTranslations } from '@/translations';

export const DecisionForm = () => {
  const { t } = useTranslations();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    situation: '',
    decision: '',
    reasoning: '',
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Basic validation
      if (!formData.situation.trim() || !formData.decision.trim()) {
        toaster.create({
          title: t('toasts.validation.title'),
          description: t('decisions.form.validation.requiredFields'),
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

        // Trigger analysis in the background (non-blocking)
        analyzeDecision(result.data.id).catch((error) => {
          console.error('Background analysis error:', error);
        });

        // Redirect to decision detail page
        router.push(`/decisions/${result.data.id}`);
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
    },
    [formData, router, t]
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

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

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
            {t('decisions.form.title')}
          </Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            {t('decisions.form.description')}
          </Text>
        </Box>

        <Stack gap={6}>
          <Field
            label={t('decisions.form.fields.situation.label')}
            required
            helperText={t('decisions.form.fields.situation.placeholder')}
          >
            <Textarea
              placeholder={t('decisions.form.fields.situation.example')}
              value={formData.situation}
              onChange={handleSituationChange}
              rows={5}
              disabled={isSubmitting}
              maxLength={5000}
            />
          </Field>

          <Field
            label={t('decisions.form.fields.decision.label')}
            required
            helperText={t('decisions.form.fields.decision.placeholder')}
          >
            <Textarea
              placeholder={t('decisions.form.fields.decision.example')}
              value={formData.decision}
              onChange={handleDecisionChange}
              rows={4}
              disabled={isSubmitting}
              maxLength={2000}
            />
          </Field>

          <Field
            label={t('decisions.form.fields.reasoning.label')}
            helperText={t('decisions.form.fields.reasoning.placeholder')}
          >
            <Textarea
              placeholder={t('decisions.form.fields.reasoning.example')}
              value={formData.reasoning}
              onChange={handleReasoningChange}
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
            loadingText={t('common.actions.creating')}
            flex={1}
          >
            {t('decisions.form.actions.create')}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {t('common.actions.cancel')}
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
};

DecisionForm.displayName = 'DecisionForm';
