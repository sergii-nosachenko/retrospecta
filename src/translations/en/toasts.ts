export const toasts = {
  validation: {
    title: 'Validation Error',
  },
  error: {
    title: 'Error',
  },
  success: {
    decisionCreated: {
      title: 'Decision Created',
      description: 'Your decision has been saved and is being analyzed...',
    },
    reAnalysisStarted: {
      title: 'Re-analysis Started',
      description: 'Your decision is being re-analyzed...',
    },
    decisionDeleted: {
      title: 'Decision Deleted',
      description: 'Your decision has been deleted successfully',
    },
    analysisComplete: {
      title: 'Analysis Complete',
      description: 'Your decision has been analyzed successfully!',
    },
  },
  errors: {
    createDecision: 'Failed to create decision',
    reAnalyze: 'Failed to re-analyze decision',
    deleteDecision: 'Failed to delete decision',
    loadDecision: 'Failed to load decision',
    unexpected: 'An unexpected error occurred',
    tryAgain: 'An unexpected error occurred. Please try again.',
    analysisFailed: {
      title: 'Analysis Failed',
      description: 'Unable to analyze your decision. Please try again.',
    },
  },
} as const;
