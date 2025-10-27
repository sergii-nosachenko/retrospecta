'use client';

import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getCurrentUser, signOut } from '@/actions/auth';
import { ErrorState } from '@/components/common/ErrorState';
import {
  DecisionListSkeleton,
  SimpleListSkeleton,
} from '@/components/common/skeletons';
import { type DecisionType } from '@/components/decisions/controls/FilterControls';
import { DecisionList } from '@/components/decisions/DecisionList';
import { DecisionsActionBar } from '@/components/decisions/DecisionsActionBar';
import { DecisionsHeader } from '@/components/decisions/DecisionsHeader';
import { Pagination } from '@/components/decisions/Pagination';
import { ROUTES } from '@/constants/routes';
import { useDecisions } from '@/contexts/DecisionsContext';
import { type SortField, type SortOrder } from '@/types/enums';

/**
 * Main decisions page component
 *
 * Displays a paginated, filterable, and sortable list of user decisions.
 * Integrates real-time updates via SSE, filtering controls, user menu,
 * and handles authentication state.
 *
 * Features:
 * - Paginated decision list with real-time updates
 * - Filter controls (decision type, bias, date range)
 * - Sorting controls (by created date, updated date, status)
 * - Mobile-responsive filter drawer
 * - User menu with authentication
 * - Active filter count badge
 * - Error handling and loading states
 * - Empty states for no decisions
 *
 * @example
 * <DecisionsPageContent />
 */
export const DecisionsPageContent = () => {
  const {
    decisions,
    isLoading,
    error,
    pendingCount,
    totalCount,
    filters,
    setFilters,
    refresh,
    optimisticCreate,
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
      setFilters({ sortBy: newSortBy, sortOrder: newSortOrder, page: 1 });
    },
    [setFilters]
  );

  const handleDecisionTypesChange = useCallback(
    (decisionTypes: DecisionType[]) => {
      setFilters({ decisionTypes, page: 1 });
    },
    [setFilters]
  );

  const handleBiasesChange = useCallback(
    (biases: string[]) => {
      setFilters({ biases, page: 1 });
    },
    [setFilters]
  );

  const handleDateFromChange = useCallback(
    (date: string | null) => {
      setFilters({ dateFrom: date, page: 1 });
    },
    [setFilters]
  );

  const handleDateToChange = useCallback(
    (date: string | null) => {
      setFilters({ dateTo: date, page: 1 });
    },
    [setFilters]
  );

  const handleClearFilters = useCallback(() => {
    setFilters({
      decisionTypes: [],
      biases: [],
      dateFrom: null,
      dateTo: null,
      page: 1,
    });
  }, [setFilters]);

  const handlePageChange = useCallback(
    (page: number) => {
      setFilters({ page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setFilters]
  );

  const handleDecisionCreated = useCallback(
    (decisionData: {
      id: string;
      situation: string;
      decision: string;
      reasoning: string | null;
    }) => {
      optimisticCreate(decisionData);
      refresh();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [optimisticCreate, refresh]
  );

  if (isCheckingAuth) {
    return (
      <Box p={{ base: 5, md: 8 }} maxW="7xl" mx="auto" minH="100vh">
        <SimpleListSkeleton />
      </Box>
    );
  }

  return (
    <Box
      px={{ base: 5, md: 8 }}
      pb={{ base: 5, md: 8 }}
      maxW="7xl"
      mx="auto"
      minH="100vh"
    >
      <Box
        position="sticky"
        top={0}
        bg="bg"
        zIndex={10}
        pt={{ base: 5, md: 8 }}
        px={{ base: 5, md: 8 }}
        pb={6}
        mx={{ base: -5, md: -8 }}
        borderBottomWidth="1px"
        borderBottomColor="border.muted"
      >
        <DecisionsHeader
          pendingCount={pendingCount}
          user={user}
          onSignOut={handleSignOut}
          onDecisionCreated={handleDecisionCreated}
        />
      </Box>

      <Box py={6} pb={{ base: 16, md: 8 }}>
        {error && <ErrorState message={error} onRetry={refresh} />}
        {!error && isLoading && decisions.length === 0 && (
          <DecisionListSkeleton />
        )}
        {!error && (!isLoading || decisions.length > 0) && (
          <>
            <DecisionList decisions={decisions} />

            {totalCount > 0 && (
              <Pagination
                currentPage={filters.page}
                pageSize={filters.pageSize}
                totalCount={totalCount}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </Box>

      <DecisionsActionBar
        filters={filters}
        onSortChange={handleSortChange}
        onDecisionTypesChange={handleDecisionTypesChange}
        onBiasesChange={handleBiasesChange}
        onDateFromChange={handleDateFromChange}
        onDateToChange={handleDateToChange}
        onClearFilters={handleClearFilters}
      />
    </Box>
  );
};

DecisionsPageContent.displayName = 'DecisionsPageContent';
