'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';

import { useDecisionFilters } from '@/hooks/useDecisionFilters';
import { useDecisionNotifications } from '@/hooks/useDecisionNotifications';
import { useDecisionsSse } from '@/hooks/useDecisionsSse';
import { useOptimisticUpdates } from '@/hooks/useOptimisticUpdates';
import { type ProcessingStatus } from '@/types/enums';

import type { FilterOptions } from '@/hooks/useDecisionFilters';
import type { Decision } from '@/types/decision';

// Re-export types for backward compatibility
export type { Decision, FilterOptions };

/**
 * Context value interface
 */
interface DecisionsContextValue {
  decisions: Decision[];
  isLoading: boolean;
  error: string | null;
  pendingCount: number;
  filters: FilterOptions;
  setFilters: (filters: Partial<FilterOptions>) => void;
  refresh: () => void;
  optimisticUpdateStatus: (
    decisionId: string,
    status: ProcessingStatus
  ) => void;
  optimisticDelete: (decisionId: string) => void;
  optimisticMarkAsRead: (decisionId: string) => void;
  getDecision: (decisionId: string) => Decision | undefined;
}

const DecisionsContext = createContext<DecisionsContextValue | null>(null);

/**
 * Hook to access decisions context
 *
 * @throws Error if used outside DecisionsProvider
 * @returns DecisionsContextValue
 *
 * @example
 * const { decisions, isLoading } = useDecisions();
 */
export const useDecisions = (): DecisionsContextValue => {
  const context = useContext(DecisionsContext);
  if (!context) {
    throw new Error('useDecisions must be used within DecisionsProvider');
  }
  return context;
};

interface DecisionsProviderProps {
  children: React.ReactNode;
}

/**
 * DecisionsProvider - Orchestrates decision management
 *
 * Simplified context provider that composes specialized hooks:
 * - useDecisionFilters: Filter state management
 * - useOptimisticUpdates: Optimistic UI updates
 * - useDecisionNotifications: Status change notifications
 * - useDecisionsSSE: Real-time SSE connection
 *
 * This architecture improves:
 * - Testability: Each hook can be tested independently
 * - Maintainability: Concerns are separated into focused modules
 * - Reusability: Hooks can be used independently if needed
 *
 * @param children - Child components
 */
export const DecisionsProvider = ({ children }: DecisionsProviderProps) => {
  // Filter management
  const { filters, setFilters } = useDecisionFilters();

  // Optimistic updates
  const {
    optimisticUpdateStatus: optimisticUpdateStatusFn,
    optimisticDelete: optimisticDeleteFn,
    optimisticMarkAsRead: optimisticMarkAsReadFn,
    clearConfirmedUpdates,
    hasOptimisticUpdate,
    getOptimisticUpdateCount,
  } = useOptimisticUpdates();

  // SSE connection with decision updates
  const {
    decisions,
    setDecisions,
    isLoading,
    error,
    pendingCount,
    setPendingCount,
    refresh,
  } = useDecisionsSse(
    filters,
    undefined, // onDecisionsUpdate - handled by notifications hook
    clearConfirmedUpdates,
    getOptimisticUpdateCount
  );

  // Status change notifications
  useDecisionNotifications(decisions, hasOptimisticUpdate);

  // Wrap optimistic update functions to provide required state setters
  const optimisticUpdateStatus = useCallback(
    (decisionId: string, status: ProcessingStatus) => {
      optimisticUpdateStatusFn(
        decisionId,
        status,
        decisions,
        setDecisions,
        setPendingCount
      );
    },
    [optimisticUpdateStatusFn, decisions, setDecisions, setPendingCount]
  );

  const optimisticDelete = useCallback(
    (decisionId: string) => {
      optimisticDeleteFn(decisionId, decisions, setDecisions, setPendingCount);
    },
    [optimisticDeleteFn, decisions, setDecisions, setPendingCount]
  );

  const optimisticMarkAsRead = useCallback(
    (decisionId: string) => {
      optimisticMarkAsReadFn(decisionId, decisions, setDecisions);
    },
    [optimisticMarkAsReadFn, decisions, setDecisions]
  );

  // Get a specific decision by ID
  const getDecision = useCallback(
    (decisionId: string) => {
      return decisions.find((d) => d.id === decisionId);
    },
    [decisions]
  );

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<DecisionsContextValue>(
    () => ({
      decisions,
      isLoading,
      error,
      pendingCount,
      filters,
      setFilters,
      refresh,
      optimisticUpdateStatus,
      optimisticDelete,
      optimisticMarkAsRead,
      getDecision,
    }),
    [
      decisions,
      isLoading,
      error,
      pendingCount,
      filters,
      setFilters,
      refresh,
      optimisticUpdateStatus,
      optimisticDelete,
      optimisticMarkAsRead,
      getDecision,
    ]
  );

  return (
    <DecisionsContext.Provider value={value}>
      {children}
    </DecisionsContext.Provider>
  );
};

// Add displayName for better debugging
DecisionsProvider.displayName = 'DecisionsProvider';
