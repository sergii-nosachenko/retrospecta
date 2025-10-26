'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Box } from '@chakra-ui/react';

import { getCurrentUser, signOut } from '@/actions/auth';
import { ErrorState } from '@/components/common/ErrorState';
import {
  DecisionListSkeleton,
  SimpleListSkeleton,
} from '@/components/common/LoadingSkeleton';
import { DecisionList } from '@/components/decisions/DecisionList';
import { DecisionsHeader } from '@/components/decisions/DecisionsHeader';
import {
  type DecisionType,
  FilterControls,
} from '@/components/decisions/FilterControls';
import { SortingControls } from '@/components/decisions/SortingControls';
import { ROUTES } from '@/constants/routes';
import { useDecisions } from '@/contexts/DecisionsContext';
import { type SortField, type SortOrder } from '@/types/enums';

export const DecisionsPageContent = () => {
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
    void getCurrentUser().then((userData) => {
      if (userData) {
        setUser(userData);
      } else {
        // User is not authenticated, redirect to login
        router.push(ROUTES.LOGIN);
      }
      setIsCheckingAuth(false);
    });
  }, [router]);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, []);

  const handleSortChange = useCallback(
    (newSortBy: SortField, newSortOrder: SortOrder) => {
      setFilters({ sortBy: newSortBy, sortOrder: newSortOrder });
    },
    [setFilters]
  );

  const handleDecisionTypesChange = useCallback(
    (decisionTypes: DecisionType[]) => {
      setFilters({ decisionTypes });
    },
    [setFilters]
  );

  const handleBiasesChange = useCallback(
    (biases: string[]) => {
      setFilters({ biases });
    },
    [setFilters]
  );

  const handleDateFromChange = useCallback(
    (date: string | null) => {
      setFilters({ dateFrom: date });
    },
    [setFilters]
  );

  const handleDateToChange = useCallback(
    (date: string | null) => {
      setFilters({ dateTo: date });
    },
    [setFilters]
  );

  const handleClearFilters = useCallback(() => {
    setFilters({
      decisionTypes: [],
      biases: [],
      dateFrom: null,
      dateTo: null,
    });
  }, [setFilters]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <Box p={{ base: 5, md: 8 }} maxW="7xl" mx="auto" minH="100vh">
        <SimpleListSkeleton />
      </Box>
    );
  }

  return (
    <Box p={{ base: 5, md: 8 }} maxW="7xl" mx="auto" minH="100vh">
      <DecisionsHeader
        isConnected={isConnected}
        pendingCount={pendingCount}
        user={user}
        onSignOut={handleSignOut}
      />

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
          selectedDecisionTypes={filters.decisionTypes as DecisionType[]}
          selectedBiases={filters.biases}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDecisionTypesChange={handleDecisionTypesChange}
          onBiasesChange={handleBiasesChange}
          onDateFromChange={handleDateFromChange}
          onDateToChange={handleDateToChange}
          onClearFilters={handleClearFilters}
        />
      </Box>

      {error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : isLoading ? (
        <DecisionListSkeleton />
      ) : (
        <DecisionList decisions={decisions} />
      )}
    </Box>
  );
};

DecisionsPageContent.displayName = 'DecisionsPageContent';
