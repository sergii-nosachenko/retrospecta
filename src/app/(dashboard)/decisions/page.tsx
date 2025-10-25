'use client';

import { useEffect, useState } from 'react';

import {
  Badge,
  Box,
  Button,
  Card,
  Heading,
  Skeleton,
  SkeletonText,
  Stack,
  VStack,
} from '@chakra-ui/react';

import { getCurrentUser, signOut } from '@/actions/auth';
import { DecisionFormModal } from '@/components/decisions/DecisionFormModal';
import { DecisionList } from '@/components/decisions/DecisionList';
import {
  type DecisionCategory,
  FilterControls,
} from '@/components/decisions/FilterControls';
import {
  type SortField,
  type SortOrder,
  SortingControls,
} from '@/components/decisions/SortingControls';
import { UserMenu } from '@/components/layout/UserMenu';
import { useDecisionStream } from '@/hooks/useDecisionStream';

export default function DecisionsPage() {
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedCategories, setSelectedCategories] = useState<
    DecisionCategory[]
  >([]);
  const [selectedBiases, setSelectedBiases] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const { decisions, isConnected, isLoading, error, pendingCount, refresh } =
    useDecisionStream({
      sortBy,
      sortOrder,
      categories: selectedCategories,
      biases: selectedBiases,
      dateFrom,
      dateTo,
    });
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  } | null>(null);

  useEffect(() => {
    getCurrentUser().then((userData) => {
      if (userData) {
        setUser(userData);
      }
    });
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSortChange = (newSortBy: SortField, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleCategoriesChange = (categories: DecisionCategory[]) => {
    setSelectedCategories(categories);
  };

  const handleBiasesChange = (biases: string[]) => {
    setSelectedBiases(biases);
  };

  const handleDateFromChange = (date: string | null) => {
    setDateFrom(date);
  };

  const handleDateToChange = (date: string | null) => {
    setDateTo(date);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedBiases([]);
    setDateFrom(null);
    setDateTo(null);
  };

  return (
    <Box p={{ base: 5, md: 8 }} maxW="7xl" mx="auto">
      <Stack
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'start', sm: 'center' }}
        mb={8}
        gap={4}
      >
        <Stack direction="row" align="center" gap={3} flexWrap="wrap">
          <Heading size="2xl">Your Decisions</Heading>
          {/* Connection status indicator */}
          <Badge
            colorPalette={isConnected ? 'green' : 'gray'}
            size="sm"
            variant="subtle"
            px={3}
            py={1}
          >
            {isConnected ? '● Live' : '○ Offline'}
          </Badge>
          {/* Pending count indicator */}
          {pendingCount > 0 && (
            <Badge colorPalette="blue" size="sm" variant="subtle" px={3} py={1}>
              {pendingCount} analyzing...
            </Badge>
          )}
        </Stack>
        <Stack direction="row" align="center" gap={2}>
          <DecisionFormModal />
          {user && <UserMenu user={user} onSignOut={handleSignOut} />}
        </Stack>
      </Stack>

      {/* Sorting Controls */}
      <Box mb={4}>
        <SortingControls
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      </Box>

      {/* Filter Controls */}
      <Box mb={6}>
        <FilterControls
          selectedCategories={selectedCategories}
          selectedBiases={selectedBiases}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onCategoriesChange={handleCategoriesChange}
          onBiasesChange={handleBiasesChange}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          onClearFilters={handleClearFilters}
        />
      </Box>

      {error ? (
        <Stack
          p={8}
          textAlign="center"
          borderWidth="1px"
          borderRadius="lg"
          borderStyle="dashed"
          borderColor="red.300"
          bg="red.50"
          _dark={{ bg: 'red.900/20', borderColor: 'red.800' }}
          gap={4}
        >
          <Box>{error}</Box>
          <Box>
            <Button onClick={refresh} colorPalette="red" size="sm" px={4}>
              Refresh
            </Button>
          </Box>
        </Stack>
      ) : isLoading ? (
        <VStack gap={5} align="stretch">
          {/* Skeleton cards for loading state */}
          {[1, 2, 3].map((i) => (
            <Card.Root key={i}>
              <Card.Body p={6}>
                <Stack gap={4}>
                  <Stack direction="row" justify="space-between" align="center">
                    <Skeleton height="24px" width="100px" />
                    <Skeleton height="16px" width="120px" />
                  </Stack>

                  <Box>
                    <Skeleton height="16px" width="60px" mb={2} />
                    <SkeletonText noOfLines={2} gap={2} />
                  </Box>

                  <Box>
                    <Skeleton height="16px" width="60px" mb={2} />
                    <SkeletonText noOfLines={3} gap={2} />
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>
      ) : (
        <DecisionList decisions={decisions} />
      )}
    </Box>
  );
}
