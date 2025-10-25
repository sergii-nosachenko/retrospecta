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

export type DecisionCategory =
  | 'EMOTIONAL'
  | 'STRATEGIC'
  | 'IMPULSIVE'
  | 'ANALYTICAL'
  | 'INTUITIVE'
  | 'COLLABORATIVE'
  | 'RISK_AVERSE'
  | 'RISK_TAKING'
  | 'OTHER';

interface CategoryFilterProps {
  selectedCategories: DecisionCategory[];
  onCategoriesChange: (categories: DecisionCategory[]) => void;
}

export function CategoryFilter({
  selectedCategories,
  onCategoriesChange,
}: CategoryFilterProps) {
  const categoryOptions = useMemo(
    () =>
      createListCollection({
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
      }),
    []
  );

  const handleCategoryChange = (value: string[]) => {
    onCategoriesChange(value as DecisionCategory[]);
  };

  return (
    <SelectRoot
      collection={categoryOptions}
      value={selectedCategories}
      onValueChange={(e) => handleCategoryChange(e.value)}
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
        {categoryOptions.items.map((item) => (
          <SelectItem key={item.value} item={item} px={3} py={2}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}
