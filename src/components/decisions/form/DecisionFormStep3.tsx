'use client';

import { Textarea, VStack } from '@chakra-ui/react';

import { Field } from '@/components/ui/field';
import { StepsContent } from '@/components/ui/steps';
import { useTranslations } from '@/translations';

interface DecisionFormStep3Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

/**
 * Third step of the decision form - Reasoning input
 *
 * Allows users to provide optional reasoning or additional context for their decision.
 * This field is optional and has no minimum length requirement.
 *
 * @param value - Current reasoning text
 * @param onChange - Change handler for textarea
 * @param disabled - Whether the input should be disabled (during submission)
 */
export const DecisionFormStep3 = ({
  value,
  onChange,
  disabled = false,
}: DecisionFormStep3Props) => {
  const { t } = useTranslations();

  return (
    <StepsContent index={2}>
      <VStack gap={4} align="stretch">
        <Field
          label={t('decisions.form.fields.reasoning.label')}
          helperText={t('decisions.form.fields.reasoning.placeholder')}
        >
          <Textarea
            placeholder={t('decisions.form.fields.reasoning.example')}
            value={value}
            onChange={onChange}
            rows={6}
            minH="150px"
            maxH="150px"
            disabled={disabled}
            maxLength={3000}
            p={3}
            autoFocus
          />
        </Field>
      </VStack>
    </StepsContent>
  );
};

DecisionFormStep3.displayName = 'DecisionFormStep3';
