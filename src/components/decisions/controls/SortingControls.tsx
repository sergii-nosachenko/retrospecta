'use client';

import { Button, HStack, Text, createListCollection } from '@chakra-ui/react';
import { useCallback } from 'react';
import { LuArrowDown, LuArrowUp } from 'react-icons/lu';

import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/select';
import { useTranslations } from '@/translations';
import { SortField, SortOrder } from '@/types/enums';

/**
 * Props for the SortingControls component
 */
interface SortingControlsProps {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
}

/**
 * Sorting controls component for decision list ordering.
 *
 * Provides a dropdown to select the sort field (createdAt, updatedAt, status, or
 * decisionType) and a toggle button to switch between ascending and descending order.
 *
 * @param sortBy - Current sort field (e.g., CREATED_AT, UPDATED_AT, STATUS, DECISION_TYPE)
 * @param sortOrder - Current sort order (ASC or DESC)
 * @param onSortChange - Callback fired when sort field or order changes
 *
 * @example
 * ```tsx
 * <SortingControls
 *   sortBy={SortField.CREATED_AT}
 *   sortOrder={SortOrder.DESC}
 *   onSortChange={(field, order) => updateSort(field, order)}
 * />
 * ```
 */
export const SortingControls = ({
  sortBy,
  sortOrder,
  onSortChange,
}: SortingControlsProps) => {
  const { t } = useTranslations();

  const sortFields = createListCollection({
    items: [
      {
        label: t('decisions.sorting.fields.createdAt'),
        value: SortField.CREATED_AT,
      },
      {
        label: t('decisions.sorting.fields.updatedAt'),
        value: SortField.UPDATED_AT,
      },
      { label: t('decisions.sorting.fields.status'), value: SortField.STATUS },
      {
        label: t('decisions.sorting.fields.decisionType'),
        value: SortField.DECISION_TYPE,
      },
    ],
  });
  const handleValueChange = useCallback(
    (e: { value: string[] }) => {
      if (e.value.length > 0) {
        onSortChange(e.value[0] as SortField, sortOrder);
      }
    },
    [onSortChange, sortOrder]
  );

  const toggleSortOrder = useCallback(() => {
    onSortChange(
      sortBy,
      sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
    );
  }, [onSortChange, sortBy, sortOrder]);

  return (
    <HStack gap={2}>
      <Text fontSize="sm" fontWeight="medium" color="fg.muted">
        {t('decisions.sorting.label')}
      </Text>

      <SelectRoot
        collection={sortFields}
        value={[sortBy]}
        onValueChange={handleValueChange}
        size="sm"
        width="180px"
      >
        <SelectTrigger>
          <SelectValueText
            placeholder={t('decisions.sorting.placeholder')}
            px={3}
          />
        </SelectTrigger>
        <SelectContent>
          {sortFields.items.map((item) => (
            <SelectItem key={item.value} item={item} px={3} py={2}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>

      <Button
        variant="outline"
        size="sm"
        onClick={toggleSortOrder}
        aria-label={
          sortOrder === SortOrder.ASC
            ? t('decisions.sorting.descending')
            : t('decisions.sorting.ascending')
        }
        px={2}
      >
        {sortOrder === SortOrder.ASC ? <LuArrowUp /> : <LuArrowDown />}
      </Button>
    </HStack>
  );
};

SortingControls.displayName = 'SortingControls';
