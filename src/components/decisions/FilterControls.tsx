'use client';

import { useMemo } from 'react';
import { LuX } from 'react-icons/lu';

import { Button, HStack, Text } from '@chakra-ui/react';

import { BiasFilter } from './BiasFilter';
import { DateRangeFilter } from './DateRangeFilter';
import { type DecisionType, DecisionTypeFilter } from './DecisionTypeFilter';

// Re-export for backwards compatibility
export type { DecisionType };

interface FilterControlsProps {
  selectedDecisionTypes: DecisionType[];
  selectedBiases: string[];
  dateFrom: string | null;
  dateTo: string | null;
  onDecisionTypesChange: (decisionTypes: DecisionType[]) => void;
  onBiasesChange: (biases: string[]) => void;
  onDateFromChange: (date: string | null) => void;
  onDateToChange: (date: string | null) => void;
  onClearFilters: () => void;
}

export const FilterControls = ({
  selectedDecisionTypes,
  selectedBiases,
  dateFrom,
  dateTo,
  onDecisionTypesChange,
  onBiasesChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}: FilterControlsProps) => {
  const hasActiveFilters = useMemo(
    () =>
      selectedDecisionTypes.length > 0 ||
      selectedBiases.length > 0 ||
      dateFrom !== null ||
      dateTo !== null,
    [selectedDecisionTypes.length, selectedBiases.length, dateFrom, dateTo]
  );

  return (
    <HStack gap={3} flexWrap="wrap" align="center">
      <Text fontSize="sm" fontWeight="medium" color="fg.muted">
        Filter by:
      </Text>

      <DecisionTypeFilter
        selectedDecisionTypes={selectedDecisionTypes}
        onDecisionTypesChange={onDecisionTypesChange}
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
};

FilterControls.displayName = 'FilterControls';
