'use client';

import { useCallback } from 'react';
import { LuArrowDown, LuArrowUp } from 'react-icons/lu';

import { Button, HStack, Text, createListCollection } from '@chakra-ui/react';

import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/select';

export type SortField = 'createdAt' | 'updatedAt' | 'status' | 'decisionType';
export type SortOrder = 'asc' | 'desc';

interface SortingControlsProps {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
}

const sortFields = createListCollection({
  items: [
    { label: 'Date Created', value: 'createdAt' },
    { label: 'Last Updated', value: 'updatedAt' },
    { label: 'Status', value: 'status' },
    { label: 'Decision Type', value: 'decisionType' },
  ],
});

export const SortingControls = ({
  sortBy,
  sortOrder,
  onSortChange,
}: SortingControlsProps) => {
  const handleValueChange = useCallback(
    (e: { value: string[] }) => {
      if (e.value.length > 0) {
        onSortChange(e.value[0] as SortField, sortOrder);
      }
    },
    [onSortChange, sortOrder]
  );

  const toggleSortOrder = useCallback(() => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  }, [onSortChange, sortBy, sortOrder]);

  return (
    <HStack gap={2}>
      <Text fontSize="sm" fontWeight="medium" color="fg.muted">
        Sort by:
      </Text>

      <SelectRoot
        collection={sortFields}
        value={[sortBy]}
        onValueChange={handleValueChange}
        size="sm"
        width="180px"
      >
        <SelectTrigger>
          <SelectValueText placeholder="Select field" px={3} />
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
        aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
        px={2}
      >
        {sortOrder === 'asc' ? <LuArrowUp /> : <LuArrowDown />}
      </Button>
    </HStack>
  );
};

SortingControls.displayName = 'SortingControls';
