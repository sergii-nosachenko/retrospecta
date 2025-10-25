'use client';

import { LuX } from 'react-icons/lu';

import { Button, HStack, Text } from '@chakra-ui/react';

import { BiasFilter } from './BiasFilter';
import { CategoryFilter, type DecisionCategory } from './CategoryFilter';
import { DateRangeFilter } from './DateRangeFilter';

// Re-export for backwards compatibility
export type { DecisionCategory };

interface FilterControlsProps {
  selectedCategories: DecisionCategory[];
  selectedBiases: string[];
  dateFrom: string | null;
  dateTo: string | null;
  onCategoriesChange: (categories: DecisionCategory[]) => void;
  onBiasesChange: (biases: string[]) => void;
  onDateFromChange: (date: string | null) => void;
  onDateToChange: (date: string | null) => void;
  onClearFilters: () => void;
}

export function FilterControls({
  selectedCategories,
  selectedBiases,
  dateFrom,
  dateTo,
  onCategoriesChange,
  onBiasesChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}: FilterControlsProps) {
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedBiases.length > 0 ||
    dateFrom !== null ||
    dateTo !== null;

  return (
    <HStack gap={3} flexWrap="wrap" align="center">
      <Text fontSize="sm" fontWeight="medium" color="fg.muted">
        Filter by:
      </Text>

      <CategoryFilter
        selectedCategories={selectedCategories}
        onCategoriesChange={onCategoriesChange}
      />

      <BiasFilter
        selectedBiases={selectedBiases}
        onBiasesChange={onBiasesChange}
      />

      <DateRangeFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={onDateFromChange}
        onDateToChange={onDateToChange}
      />

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          colorPalette="gray"
          px={3}
        >
          <LuX />
          Clear filters
        </Button>
      )}
    </HStack>
  );
}
