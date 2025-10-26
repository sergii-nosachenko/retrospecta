'use client';

import {
  Badge,
  Box,
  Button,
  type DrawerOpenChangeDetails,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LuFilter, LuX } from 'react-icons/lu';

import { getCurrentUser, signOut } from '@/actions/auth';
import { ErrorState } from '@/components/common/ErrorState';
import {
  DecisionListSkeleton,
  SimpleListSkeleton,
} from '@/components/common/skeletons';
import {
  type DecisionType,
  FilterControls,
} from '@/components/decisions/controls/FilterControls';
import { SortingControls } from '@/components/decisions/controls/SortingControls';
import { DecisionList } from '@/components/decisions/DecisionList';
import { DecisionsHeader } from '@/components/decisions/DecisionsHeader';
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
import { ROUTES } from '@/constants/routes';
import { useDecisions } from '@/contexts/DecisionsContext';
import { useTranslations } from '@/translations';
import { type SortField, type SortOrder } from '@/types/enums';

export const DecisionsPageContent = () => {
  const {
    decisions,
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const router = useRouter();
  const { t } = useTranslations();

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

  const handleTriggerDrawer = useCallback(
    (details: DrawerOpenChangeDetails) => {
      setIsFiltersOpen(details.open);
    },
    []
  );

  const handleDecisionCreated = useCallback(() => {
    // Scroll to top of the page when a new decision is created
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.decisionTypes.length > 0) count += filters.decisionTypes.length;
    if (filters.biases.length > 0) count += filters.biases.length;
    if (filters.dateFrom) count += 1;
    if (filters.dateTo) count += 1;
    return count;
  }, [filters]);

  // Show loading state while checking authentication
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
      {/* Sticky header section */}
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

      <Box py={6}>
        {error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : isLoading ? (
          <DecisionListSkeleton />
        ) : (
          <DecisionList decisions={decisions} />
        )}
      </Box>

      {/* Action Bar for filters */}
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
                      {/* Sorting Controls */}
                      <Box>
                        <SortingControls
                          sortBy={filters.sortBy}
                          sortOrder={filters.sortOrder}
                          onSortChange={handleSortChange}
                        />
                      </Box>

                      {/* Filter Controls */}
                      <Box>
                        <FilterControls
                          selectedDecisionTypes={
                            filters.decisionTypes as DecisionType[]
                          }
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
                    </Box>
                  </DrawerBody>
                </DrawerContent>
              </DrawerRoot>

              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
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
    </Box>
  );
};

DecisionsPageContent.displayName = 'DecisionsPageContent';
