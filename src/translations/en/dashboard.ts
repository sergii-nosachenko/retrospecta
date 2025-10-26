export const dashboard = {
  title: 'Dashboard',
  stats: {
    totalDecisions: 'Total Decisions',
    completedAnalyses: 'Completed Analyses',
    pendingProcessing: 'Pending/Processing',
    recent: 'Recent (7 days)',
  },
  chart: {
    tooltip: {
      count: 'Count: ',
      occurrences: 'Occurrences: ',
    },
  },
  empty: {
    title: '{title}',
    description:
      'No data available yet. Complete some decision analyses to see insights!',
  },
  errors: {
    loadFailed: 'Failed to load analytics',
  },
} as const;
