'use client';

import { Textarea, VStack } from '@chakra-ui/react';

import { Field } from '@/components/ui/field';
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
export const DecisionFormStep2 = ({
  value,
  onChange,
  disabled = false,
}: DecisionFormStep2Props) => {
  const { t } = useTranslations();

  return (
    <StepsContent index={1}>
      <VStack gap={4} align="stretch">
        <Field
          label={t('decisions.form.fields.decision.label')}
          required
          helperText={t('decisions.form.fields.decision.placeholder')}
        >
          <Textarea
            placeholder={t('decisions.form.fields.decision.example')}
            value={value}
            onChange={onChange}
            rows={6}
            minH="150px"
            maxH="150px"
            disabled={disabled}
            maxLength={2000}
            p={3}
            autoFocus
          />
        </Field>
      </VStack>
    </StepsContent>
  );
};

DecisionFormStep2.displayName = 'DecisionFormStep2';
