export const errors = {
  auth: {
    notLoggedIn: 'You must be logged in to {action}',
    permissionDenied: 'You do not have permission to {action}',
  },
  decisions: {
    notFound: 'Decision not found',
    createFailed: 'Failed to create decision. Please try again.',
    fetchFailed: 'Failed to fetch decisions. Please try again.',
    fetchOneFailed: 'Failed to fetch decision. Please try again.',
    deleteFailed: 'Failed to delete decision. Please try again.',
    reAnalyzeFailed: 'Failed to re-analyze decision. Please try again.',
    contextError: 'useDecisions must be used within DecisionsProvider',
    connectionLost: 'Connection lost. Please refresh the page.',
    connectionFailed: 'Failed to establish connection',
    streamError: 'An error occurred',
  },
  analysis: {
    failed: 'Analysis failed',
    unexpected: 'An unexpected error occurred',
  },
  analytics: {
    fetchFailed: 'Failed to fetch analytics. Please try again.',
  },
  actions: {
    createDecision: 'create a decision',
    viewDecisions: 'view decisions',
    viewDecision: 'view this decision',
    deleteDecision: 'delete a decision',
    viewAnalytics: 'view analytics',
  },
} as const;
