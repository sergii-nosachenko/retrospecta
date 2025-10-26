'use client';

import { VStack } from '@chakra-ui/react';
import { memo } from 'react';

import { FormTextareaField } from '@/components/common';
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
const DecisionFormStep3Component = ({
  value,
  onChange,
  disabled = false,
}: DecisionFormStep3Props) => {
  const { t } = useTranslations();

  return (
    <StepsContent index={2}>
      <VStack gap={4} align="stretch">
        <FormTextareaField
          label={t('decisions.form.fields.reasoning.label')}
          value={value}
          onChange={onChange}
          placeholder={t('decisions.form.fields.reasoning.example')}
          helperText={t('decisions.form.fields.reasoning.placeholder')}
          disabled={disabled}
          maxLength={3000}
          autoFocus
        />
      </VStack>
    </StepsContent>
  );
};

export const DecisionFormStep3 = memo(DecisionFormStep3Component);
DecisionFormStep3.displayName = 'DecisionFormStep3';
