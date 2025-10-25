'use client';

import { useMemo } from 'react';
import { LuArrowDown, LuArrowUp } from 'react-icons/lu';

import { Button, HStack, Text, createListCollection } from '@chakra-ui/react';

import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '@/components/ui/select';

export type SortField = 'createdAt' | 'updatedAt' | 'status' | 'category';
export type SortOrder = 'asc' | 'desc';

interface SortingControlsProps {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
}

export function SortingControls({
  sortBy,
  sortOrder,
  onSortChange,
}: SortingControlsProps) {
  const sortFields = useMemo(
    () =>
      createListCollection({
        items: [
          { label: 'Date Created', value: 'createdAt' },
          { label: 'Last Updated', value: 'updatedAt' },
          { label: 'Status', value: 'status' },
          { label: 'Category', value: 'category' },
        ],
      }),
    []
  );

  const handleFieldChange = (value: string[]) => {
    if (value.length > 0) {
      onSortChange(value[0] as SortField, sortOrder);
    }
  };

  const toggleSortOrder = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <HStack gap={2}>
      <Text fontSize="sm" fontWeight="medium" color="fg.muted">
        Sort by:
      </Text>

      <SelectRoot
        collection={sortFields}
        value={[sortBy]}
        onValueChange={(e) => handleFieldChange(e.value)}
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
}
