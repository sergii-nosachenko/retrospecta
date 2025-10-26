'use client';

import { Button, HStack, Text } from '@chakra-ui/react';
import { memo, useMemo } from 'react';
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from 'react-icons/lu';

import { useTranslations } from '@/translations';

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

const PaginationComponent = ({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
}: PaginationProps) => {
  const { t } = useTranslations();

  const totalPages = useMemo(
    () => Math.ceil(totalCount / pageSize),
    [totalCount, pageSize]
  );

  const startItem = useMemo(
    () => (currentPage - 1) * pageSize + 1,
    [currentPage, pageSize]
  );

  const endItem = useMemo(
    () => Math.min(currentPage * pageSize, totalCount),
    [currentPage, pageSize, totalCount]
  );

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Maximum number of page buttons to show

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range to always show maxVisible pages
      if (currentPage <= 3) {
        end = maxVisible - 1;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - maxVisible + 2;
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  if (totalCount === 0) {
    return null;
  }

  return (
    <HStack
      justify={{ base: 'center', md: 'space-between' }}
      align="center"
      py={4}
      flexWrap="wrap"
      gap={4}
    >
      {/* Results info */}
      <Text
        fontSize="sm"
        color="fg.muted"
        width={{ base: '100%', md: 'auto' }}
        textAlign={{ base: 'center', md: 'left' }}
        order={{ base: 2, md: 1 }}
      >
        {t('decisions.pagination.showing', {
          start: startItem,
          end: endItem,
          total: totalCount,
        })}
      </Text>

      {/* Pagination controls */}
      <HStack gap={1} order={{ base: 1, md: 2 }}>
        {/* First page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          <LuChevronsLeft />
        </Button>

        {/* Previous page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <LuChevronLeft />
        </Button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <Text
                key={`ellipsis-${index}`}
                px={2}
                fontSize="sm"
                color="fg.muted"
              >
                ...
              </Text>
            );
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? 'solid' : 'ghost'}
              colorPalette={currentPage === page ? 'blue' : 'gray'}
              size="sm"
              onClick={() => onPageChange(page as number)}
              minW="40px"
            >
              {page}
            </Button>
          );
        })}

        {/* Next page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <LuChevronRight />
        </Button>

        {/* Last page */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          <LuChevronsRight />
        </Button>
      </HStack>
    </HStack>
  );
};

export const Pagination = memo(PaginationComponent);

Pagination.displayName = 'Pagination';
