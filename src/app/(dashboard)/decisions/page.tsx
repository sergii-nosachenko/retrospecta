'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

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
import { Logo } from '@/components/Logo';
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
import { DecisionsProvider, useDecisions } from '@/contexts/DecisionsContext';

function DecisionsPageContent() {
  const {
    decisions,
    isConnected,
    isLoading,
    error,
    pendingCount,
    filters,
    setFilters,
    refresh,
  } = useDecisions();
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
  } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then((userData) => {
      if (userData) {
        setUser(userData);
      } else {
        // User is not authenticated, redirect to login
        router.push('/login');
      }
      setIsCheckingAuth(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSortChange = (newSortBy: SortField, newSortOrder: SortOrder) => {
    setFilters({ sortBy: newSortBy, sortOrder: newSortOrder });
  };

  const handleCategoriesChange = (categories: DecisionCategory[]) => {
    setFilters({ categories });
  };

  const handleBiasesChange = (biases: string[]) => {
    setFilters({ biases });
  };

  const handleDateFromChange = (date: string | null) => {
    setFilters({ dateFrom: date });
  };

  const handleDateToChange = (date: string | null) => {
    setFilters({ dateTo: date });
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      biases: [],
      dateFrom: null,
      dateTo: null,
    });
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <Box p={{ base: 5, md: 8 }} maxW="7xl" mx="auto" minH="100vh">
        <Stack gap={5} align="stretch">
          <Skeleton height="40px" width="200px" />
          <VStack gap={5} align="stretch">
            {[1, 2, 3].map((i) => (
              <Card.Root key={i}>
                <Card.Body p={6}>
                  <Stack gap={4}>
                    <Skeleton height="24px" width="100px" />
                    <SkeletonText noOfLines={3} gap={2} />
                  </Stack>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        </Stack>
      </Box>
    );
  }

  return (
    <Box p={{ base: 5, md: 8 }} maxW="7xl" mx="auto" minH="100vh">
      <Stack
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'start', sm: 'center' }}
        mb={8}
        gap={4}
      >
        <Stack direction="row" align="center" gap={3} flexWrap="wrap">
          <Logo size="2xl" />
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
          {user ? (
            <UserMenu user={user} onSignOut={handleSignOut} />
          ) : (
            <Skeleton width="32px" height="32px" borderRadius="full" />
          )}
        </Stack>
      </Stack>

      {/* Sorting Controls */}
      <Box mb={4}>
        <SortingControls
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSortChange={handleSortChange}
        />
      </Box>

      {/* Filter Controls */}
      <Box mb={6}>
        <FilterControls
          selectedCategories={filters.categories as DecisionCategory[]}
          selectedBiases={filters.biases}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
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

export default function DecisionsPage() {
  return (
    <DecisionsProvider>
      <DecisionsPageContent />
    </DecisionsProvider>
  );
}
