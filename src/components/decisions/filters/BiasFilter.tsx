'use client';

import { createListCollection } from '@chakra-ui/react';
import { useCallback, useMemo } from 'react';

import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/select';
import { useTranslations } from '@/translations';
import { CognitiveBias } from '@/types/enums';

// Get all cognitive biases from the enum
const COMMON_BIASES = Object.values(CognitiveBias);

/**
 * Props for the BiasFilter component
 */
interface BiasFilterProps {
  selectedBiases: string[];
  onBiasesChange: (biases: string[]) => void;
}

/**
 * Multi-select dropdown filter for cognitive biases.
 *
 * Allows users to filter decisions by selecting one or more cognitive bias types
 * from a predefined list. Displays the count of selected biases or individual
 * bias name when only one is selected.
 *
 * @param selectedBiases - Array of currently selected cognitive bias enum values
 * @param onBiasesChange - Callback fired when the bias selection changes
 *
 * @example
 * ```tsx
 * <BiasFilter
 *   selectedBiases={['CONFIRMATION_BIAS', 'ANCHORING']}
 *   onBiasesChange={(biases) => setSelectedBiases(biases)}
 * />
 * ```
 */
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
