'use client';

import { VStack } from '@chakra-ui/react';
import { memo } from 'react';

import { FormTextareaField } from '@/components/common';
import { StepsContent } from '@/components/ui/steps';
import { useTranslations } from '@/translations';

interface DecisionFormStep1Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

/**
 * First step of the decision form - Situation input
 *
 * Allows users to describe the context and background of their decision.
 * This is a required field with a minimum length of 10 characters.
 *
 * @param value - Current situation text
 * @param onChange - Change handler for textarea
 * @param disabled - Whether the input should be disabled (during submission)
 */
const DecisionFormStep1Component = ({
  value,
  onChange,
  disabled = false,
}: DecisionFormStep1Props) => {
  const { t } = useTranslations();

  return (
    <StepsContent index={0}>
      <VStack gap={4} align="stretch">
        <FormTextareaField
          label={t('decisions.form.fields.situation.label')}
          value={value}
          onChange={onChange}
          placeholder={t('decisions.form.fields.situation.example')}
          helperText={t('decisions.form.fields.situation.placeholder')}
          required
          disabled={disabled}
          maxLength={5000}
          autoFocus
        />
      </VStack>
    </StepsContent>
  );
};

export const DecisionFormStep1 = memo(DecisionFormStep1Component);
DecisionFormStep1.displayName = 'DecisionFormStep1';
