'use client';

import { Button, HStack, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { LuX } from 'react-icons/lu';

import { type DecisionType } from '@/constants/decisions';
import { useTranslations } from '@/translations';

import { BiasFilter } from '../filters/BiasFilter';
import { DateRangeFilter } from '../filters/DateRangeFilter';
import { DecisionTypeFilter } from '../filters/DecisionTypeFilter';

// Re-export for backwards compatibility
export type { DecisionType };

/**
 * Props for the FilterControls component
 */
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

/**
 * Composite filter controls component for decision list filtering.
 *
 * Combines multiple filter types (decision type, biases, date range) into a single
 * horizontal control panel. Includes a "Clear Filters" button that appears when any
 * filters are active.
 *
 * @param selectedDecisionTypes - Array of selected decision type values
 * @param selectedBiases - Array of selected cognitive bias values
 * @param dateFrom - Start date for date range filter (ISO string) or null
 * @param dateTo - End date for date range filter (ISO string) or null
 * @param onDecisionTypesChange - Callback for decision type filter changes
 * @param onBiasesChange - Callback for bias filter changes
 * @param onDateFromChange - Callback for start date changes
 * @param onDateToChange - Callback for end date changes
 * @param onClearFilters - Callback to clear all active filters
 *
 * @example
 * ```tsx
 * <FilterControls
 *   selectedDecisionTypes={['EMOTIONAL']}
 *   selectedBiases={['CONFIRMATION_BIAS']}
 *   dateFrom="2024-01-01"
 *   dateTo="2024-12-31"
 *   onDecisionTypesChange={setDecisionTypes}
 *   onBiasesChange={setBiases}
 *   onDateFromChange={setDateFrom}
 *   onDateToChange={setDateTo}
 *   onClearFilters={handleClearAll}
 * />
 * ```
 */
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
  const { t } = useTranslations();

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
        {t('decisions.filters.label')}
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
          {t('decisions.filters.clear')}
        </Button>
      )}
    </HStack>
  );
};

FilterControls.displayName = 'FilterControls';
