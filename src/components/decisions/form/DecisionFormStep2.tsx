'use client';

import { VStack } from '@chakra-ui/react';
import { memo } from 'react';

import { FormTextareaField } from '@/components/common';
import { StepsContent } from '@/components/ui/steps';
import { useTranslations } from '@/translations';

interface DecisionFormStep2Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

/**
 * Second step of the decision form - Decision input
 *
 * Allows users to describe the actual decision they made or are considering.
 * This is a required field with a minimum length of 5 characters.
 *
 * @param value - Current decision text
 * @param onChange - Change handler for textarea
 * @param disabled - Whether the input should be disabled (during submission)
 */
const DecisionFormStep2Component = ({
  value,
  onChange,
  disabled = false,
}: DecisionFormStep2Props) => {
  const { t } = useTranslations();

  return (
    <StepsContent index={1}>
      <VStack gap={4} align="stretch">
        <FormTextareaField
          label={t('decisions.form.fields.decision.label')}
          value={value}
          onChange={onChange}
          placeholder={t('decisions.form.fields.decision.example')}
          helperText={t('decisions.form.fields.decision.placeholder')}
          required
          disabled={disabled}
          maxLength={2000}
          autoFocus
        />
      </VStack>
    </StepsContent>
  );
};

export const DecisionFormStep2 = memo(DecisionFormStep2Component);
DecisionFormStep2.displayName = 'DecisionFormStep2';
