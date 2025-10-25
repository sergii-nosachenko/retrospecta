'use client';

import { useMemo } from 'react';

import { createListCollection } from '@chakra-ui/react';

import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/select';

// Common cognitive biases that might be detected
export const COMMON_BIASES = [
  'Confirmation Bias',
  'Anchoring Bias',
  'Availability Heuristic',
  'Sunk Cost Fallacy',
  'Recency Bias',
  'Overconfidence Bias',
  'Hindsight Bias',
  'Status Quo Bias',
  'Loss Aversion',
  'Framing Effect',
  'Groupthink',
  'Authority Bias',
  'Bandwagon Effect',
  'Dunning-Kruger Effect',
  'Optimism Bias',
  'Negativity Bias',
];

interface BiasFilterProps {
  selectedBiases: string[];
  onBiasesChange: (biases: string[]) => void;
}

export function BiasFilter({
  selectedBiases,
  onBiasesChange,
}: BiasFilterProps) {
  const biasOptions = useMemo(
    () =>
      createListCollection({
        items: COMMON_BIASES.map((bias) => ({
          label: bias,
          value: bias,
        })),
      }),
    []
  );

  const handleBiasChange = (value: string[]) => {
    onBiasesChange(value);
  };

  return (
    <SelectRoot
      collection={biasOptions}
      value={selectedBiases}
      onValueChange={(e) => handleBiasChange(e.value)}
      size="sm"
      width="200px"
      multiple
    >
      <SelectTrigger>
        <SelectValueText placeholder="Biases" px={3}>
          {(items) => {
            if (items.length === 0) return 'Biases';
            if (items.length === 1) return items[0].label;
            return `${items.length} biases selected`;
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
}
