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
import { type DecisionType } from '@/constants/decisions';
import { useTranslations } from '@/translations';

interface DecisionTypeFilterProps {
  selectedDecisionTypes: DecisionType[];
  onDecisionTypesChange: (decisionTypes: DecisionType[]) => void;
}

export const DecisionTypeFilter = ({
  selectedDecisionTypes,
  onDecisionTypesChange,
}: DecisionTypeFilterProps) => {
  const { t } = useTranslations();

  const decisionTypeOptions = createListCollection({
    items: [
      { label: t('decisions.decisionTypes.EMOTIONAL'), value: 'EMOTIONAL' },
      { label: t('decisions.decisionTypes.STRATEGIC'), value: 'STRATEGIC' },
      { label: t('decisions.decisionTypes.IMPULSIVE'), value: 'IMPULSIVE' },
      { label: t('decisions.decisionTypes.ANALYTICAL'), value: 'ANALYTICAL' },
      { label: t('decisions.decisionTypes.INTUITIVE'), value: 'INTUITIVE' },
      {
        label: t('decisions.decisionTypes.COLLABORATIVE'),
        value: 'COLLABORATIVE',
      },
      { label: t('decisions.decisionTypes.RISK_AVERSE'), value: 'RISK_AVERSE' },
      { label: t('decisions.decisionTypes.RISK_TAKING'), value: 'RISK_TAKING' },
      { label: t('decisions.decisionTypes.OTHER'), value: 'OTHER' },
    ],
  });
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
        <SelectValueText
          placeholder={t('decisions.filters.decisionType.label')}
          px={3}
        >
          {(items: { label: string; value: string }[]) => {
            if (items.length === 0)
              return t('decisions.filters.decisionType.label');
            if (items.length === 1) return items[0].label;
            return t('decisions.filters.decisionType.selected', {
              count: items.length,
            });
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
