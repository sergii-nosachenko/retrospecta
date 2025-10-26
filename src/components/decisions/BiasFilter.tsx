'use client';

import { useCallback, useMemo } from 'react';

import { createListCollection } from '@chakra-ui/react';

import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/select';
import { useTranslations } from '@/translations';

// Common cognitive biases that might be detected - using enum keys
export const COMMON_BIASES = [
  'CONFIRMATION_BIAS',
  'ANCHORING_BIAS',
  'AVAILABILITY_HEURISTIC',
  'SUNK_COST_FALLACY',
  'RECENCY_BIAS',
  'OVERCONFIDENCE_BIAS',
  'HINDSIGHT_BIAS',
  'STATUS_QUO_BIAS',
  'LOSS_AVERSION',
  'FRAMING_EFFECT',
  'GROUPTHINK',
  'AUTHORITY_BIAS',
  'BANDWAGON_EFFECT',
  'DUNNING_KRUGER_EFFECT',
  'OPTIMISM_BIAS',
  'NEGATIVITY_BIAS',
] as const;

interface BiasFilterProps {
  selectedBiases: string[];
  onBiasesChange: (biases: string[]) => void;
}

export const BiasFilter = ({
  selectedBiases,
  onBiasesChange,
}: BiasFilterProps) => {
  const { t } = useTranslations();

  const biasOptions = useMemo(
    () =>
      createListCollection({
        items: COMMON_BIASES.map((bias) => ({
          label: t(`decisions.biases.${bias}` as const),
          value: bias,
        })),
      }),
    [t]
  );

  const handleBiasChange = useCallback(
    (event: { value: string[] }) => {
      onBiasesChange(event.value);
    },
    [onBiasesChange]
  );

  return (
    <SelectRoot
      collection={biasOptions}
      value={selectedBiases}
      onValueChange={handleBiasChange}
      size="sm"
      width="200px"
      multiple
    >
      <SelectTrigger>
        <SelectValueText
          placeholder={t('decisions.filters.biases.label')}
          px={3}
        >
          {(items: { label: string; value: string }[]) => {
            if (items.length === 0) return t('decisions.filters.biases.label');
            if (items.length === 1) return items[0].label;
            return t('decisions.filters.biases.selected', {
              count: items.length,
            });
          }}
        </SelectValueText>
      </SelectTrigger>
      <SelectContent maxH="300px" overflowY="auto">
        {biasOptions.items.map((item) => (
          <SelectItem key={item.value} item={item} px={3} py={2}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};

BiasFilter.displayName = 'BiasFilter';
