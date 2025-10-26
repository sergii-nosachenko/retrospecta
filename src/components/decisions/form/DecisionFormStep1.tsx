'use client';

import { Textarea, VStack } from '@chakra-ui/react';

import { Field } from '@/components/ui/field';
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
export const DecisionFormStep1 = ({
  value,
  onChange,
  disabled = false,
}: DecisionFormStep1Props) => {
  const { t } = useTranslations();

  return (
    <StepsContent index={0}>
      <VStack gap={4} align="stretch">
        <Field
          label={t('decisions.form.fields.situation.label')}
          required
          helperText={t('decisions.form.fields.situation.placeholder')}
        >
          <Textarea
            placeholder={t('decisions.form.fields.situation.example')}
            value={value}
            onChange={onChange}
            rows={6}
            minH="150px"
            maxH="150px"
            disabled={disabled}
            maxLength={5000}
            p={3}
            autoFocus
          />
        </Field>
      </VStack>
    </StepsContent>
  );
};

DecisionFormStep1.displayName = 'DecisionFormStep1';
