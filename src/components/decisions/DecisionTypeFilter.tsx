'use client';

import { useCallback } from 'react';

import { createListCollection } from '@chakra-ui/react';

import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/select';
import { type DecisionCategory } from '@/constants/decisions';

export type DecisionType = DecisionCategory;

interface DecisionTypeFilterProps {
  selectedDecisionTypes: DecisionType[];
  onDecisionTypesChange: (decisionTypes: DecisionType[]) => void;
}

const decisionTypeOptions = createListCollection({
  items: [
    { label: 'Emotional', value: 'EMOTIONAL' },
    { label: 'Strategic', value: 'STRATEGIC' },
    { label: 'Impulsive', value: 'IMPULSIVE' },
    { label: 'Analytical', value: 'ANALYTICAL' },
    { label: 'Intuitive', value: 'INTUITIVE' },
    { label: 'Collaborative', value: 'COLLABORATIVE' },
    { label: 'Risk Averse', value: 'RISK_AVERSE' },
    { label: 'Risk Taking', value: 'RISK_TAKING' },
    { label: 'Other', value: 'OTHER' },
  ],
});

export const DecisionTypeFilter = ({
  selectedDecisionTypes,
  onDecisionTypesChange,
}: DecisionTypeFilterProps) => {
  const handleDecisionTypeChange = useCallback(
    (event: { value: string[] }) => {
      onDecisionTypesChange(event.value as DecisionType[]);
    },
    [onDecisionTypesChange]
  );

  return (
    <SelectRoot
      collection={decisionTypeOptions}
      value={selectedDecisionTypes}
      onValueChange={handleDecisionTypeChange}
      size="sm"
      width="200px"
      multiple
    >
      <SelectTrigger>
        <SelectValueText placeholder="Decision Type" px={3}>
          {(items) => {
            if (items.length === 0) return 'Decision Type';
            if (items.length === 1) return items[0].label;
            return `${items.length} types selected`;
          }}
        </SelectValueText>
      </SelectTrigger>
      <SelectContent>
        {decisionTypeOptions.items.map((item) => (
          <SelectItem key={item.value} item={item} px={3} py={2}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};

DecisionTypeFilter.displayName = 'DecisionTypeFilter';
