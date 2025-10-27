'use client';

import {
  Badge,
  Box,
  Button,
  type DrawerOpenChangeDetails,
} from '@chakra-ui/react';
import { memo, useCallback, useMemo, useState } from 'react';
import { LuFilter, LuX } from 'react-icons/lu';

import {
  type DecisionType,
  FilterControls,
} from '@/components/decisions/controls/FilterControls';
import { SortingControls } from '@/components/decisions/controls/SortingControls';
import { ActionBarContent, ActionBarRoot } from '@/components/ui/action-bar';
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useTranslations } from '@/translations';
import { type SortField, type SortOrder } from '@/types/enums';

import type { FilterOptions } from '@/hooks/useDecisionFilters';

interface DecisionsActionBarProps {
  filters: FilterOptions;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
  onDecisionTypesChange: (decisionTypes: DecisionType[]) => void;
  onBiasesChange: (biases: string[]) => void;
  onDateFromChange: (date: string | null) => void;
  onDateToChange: (date: string | null) => void;
  onClearFilters: () => void;
}

/**
 * Action bar component with filter and sort controls
 *
 * Provides a sticky bottom action bar with:
 * - Filter drawer trigger with active filter count badge
 * - Sort controls (created date, updated date, status)
 * - Filter controls (decision types, biases, date range)
 * - Clear filters button (shown when filters are active)
 *
 * @param filters - Current filter options
 * @param onSortChange - Callback for sort field/order changes
 * @param onDecisionTypesChange - Callback for decision type filter changes
 * @param onBiasesChange - Callback for bias filter changes
 * @param onDateFromChange - Callback for start date filter changes
 * @param onDateToChange - Callback for end date filter changes
 * @param onClearFilters - Callback to clear all filters
 */
const DecisionsActionBarComponent = ({
  filters,
  onSortChange,
  onDecisionTypesChange,
  onBiasesChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
}: DecisionsActionBarProps) => {
  const { t } = useTranslations();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleTriggerDrawer = useCallback(
    (details: DrawerOpenChangeDetails) => {
      setIsFiltersOpen(details.open);
    },
    []
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.decisionTypes.length > 0) count += filters.decisionTypes.length;
    if (filters.biases.length > 0) count += filters.biases.length;
    if (filters.dateFrom) count += 1;
    if (filters.dateTo) count += 1;
    return count;
  }, [filters]);

  return (
    <Box>
      <ActionBarRoot open>
        <ActionBarContent p={3}>
          <Box display="flex" gap={2} width="full">
            <DrawerRoot
              open={isFiltersOpen}
              onOpenChange={handleTriggerDrawer}
              placement="bottom"
            >
              <DrawerBackdrop />
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  flex={1}
                  justifyContent="flex-start"
                  px={4}
                  py={3}
                >
                  <LuFilter />
                  <span>{t('decisions.filters.toggleLabel')}</span>
                  {activeFiltersCount > 0 && (
                    <Badge
                      colorPalette="blue"
                      size="sm"
                      variant="solid"
                      borderRadius="full"
                      ml={2}
                      px={2}
                      py={0.5}
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader pt={4} pb={2}>
                  <Box
                    maxW="7xl"
                    mx="auto"
                    w="full"
                    px={{ base: 5, md: 8 }}
                    position="relative"
                  >
                    <DrawerTitle>
                      {t('decisions.filters.toggleLabel')}
                    </DrawerTitle>
                    <DrawerCloseTrigger
                      position="absolute"
                      top={0}
                      right={{ base: 5, md: 8 }}
                    />
                  </Box>
                </DrawerHeader>
                <DrawerBody pt={2} pb={4}>
                  <Box
                    spaceY={6}
                    maxW="7xl"
                    mx="auto"
                    w="full"
                    px={{ base: 5, md: 8 }}
                  >
                    <Box>
                      <SortingControls
                        sortBy={filters.sortBy}
                        sortOrder={filters.sortOrder}
                        onSortChange={onSortChange}
                      />
                    </Box>

                    <Box>
                      <FilterControls
                        selectedDecisionTypes={
                          filters.decisionTypes as DecisionType[]
                        }
                        selectedBiases={filters.biases}
                        dateFrom={filters.dateFrom}
                        dateTo={filters.dateTo}
                        onDecisionTypesChange={onDecisionTypesChange}
                        onBiasesChange={onBiasesChange}
                        onDateFromChange={onDateFromChange}
                        onDateToChange={onDateToChange}
                        onClearFilters={onClearFilters}
                      />
                    </Box>
                  </Box>
                </DrawerBody>
              </DrawerContent>
            </DrawerRoot>

            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                px={4}
                py={3}
              >
                <LuX />
                {t('decisions.filters.clear')}
              </Button>
            )}
          </Box>
        </ActionBarContent>
      </ActionBarRoot>
    </Box>
  );
};

export const DecisionsActionBar = memo(DecisionsActionBarComponent);

DecisionsActionBar.displayName = 'DecisionsActionBar';
