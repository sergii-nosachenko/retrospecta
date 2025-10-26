import { useCallback, useState } from 'react';

import { SortField, SortOrder } from '@/types/enums';

/**
 * Filter options for decisions list
 */
export interface FilterOptions {
  sortBy: SortField;
  sortOrder: SortOrder;
  decisionTypes: string[];
  biases: string[];
  dateFrom: string | null;
  dateTo: string | null;
}

/**
 * Default filter values
 */
const defaultFilters: FilterOptions = {
  sortBy: SortField.CREATED_AT,
  sortOrder: SortOrder.DESC,
  decisionTypes: [],
  biases: [],
  dateFrom: null,
  dateTo: null,
};

/**
 * Custom hook for managing decision filter state
 *
 * Provides state management for filter options including:
 * - Sorting (field and order)
 * - Decision type filtering
 * - Bias filtering
 * - Date range filtering
 *
 * @returns Filter state and setter function
 *
 * @example
 * const { filters, setFilters } = useDecisionFilters();
 *
 * // Update specific filters
 * setFilters({ sortBy: SortField.UPDATED_AT });
 *
 * // Update multiple filters
 * setFilters({
 *   decisionTypes: ['ANALYTICAL'],
 *   sortOrder: SortOrder.ASC
 * });
 */
export const useDecisionFilters = () => {
  const [filters, setFiltersState] = useState<FilterOptions>(defaultFilters);

  const setFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return { filters, setFilters };
};
