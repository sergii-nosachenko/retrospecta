export const decisions = {
  header: {
    title: 'Your Decisions',
    analyzingCount: '{count} analyzing...',
  },
  form: {
    title: 'Record a Decision',
    description:
      'Describe your decision and receive AI-powered insights about your decision-making process',
    steps: {
      situation: 'Situation',
      decision: 'Decision',
      reasoning: 'Reasoning',
    },
    fields: {
      situation: {
        label: 'Situation',
        placeholder:
          'Describe the situation that led to your decision (min 10 characters)',
        example: 'Example: I was choosing between two job offers...',
        modalPlaceholder: 'Describe the context',
      },
      decision: {
        label: 'Decision',
        placeholder: 'What did you decide to do? (min 5 characters)',
        example: 'Example: I chose the job with better work-life balance...',
        modalPlaceholder: 'What did you decide?',
      },
      reasoning: {
        label: 'Reasoning (Optional)',
        placeholder:
          'Why did you make this decision? What factors influenced you?',
        example:
          'Example: I realized that my mental health and time with family...',
        modalPlaceholder: 'Why this choice?',
      },
    },
    validation: {
      situationRequired: 'Please describe the situation',
      situationMinLength: 'Situation must be at least 10 characters',
      decisionRequired: 'Please describe your decision',
      decisionMinLength: 'Decision must be at least 5 characters',
      allFieldsRequired: 'Please complete all required fields',
      requiredFields: 'Please fill in both situation and decision fields',
    },
    actions: {
      create: 'Create Decision',
      newDecision: 'New Decision',
    },
  },
  list: {
    columns: {
      decision: 'Decision',
      situation: 'Situation',
    },
    actions: {
      reAnalyze: 'Re-analyze',
      delete: 'Delete',
      showMore: '+{count} more',
    },
    empty: {
      title: 'No decisions yet',
      description:
        'Start recording your decisions to receive AI-powered insights about your decision-making patterns.',
      cta: 'New Decision',
    },
    status: {
      completed: 'COMPLETED',
      pending: 'PENDING',
      processing: 'PROCESSING',
      failed: 'FAILED',
    },
  },
  detail: {
    title: 'Decision Details',
    sections: {
      situation: 'Situation',
      decision: 'Decision',
      reasoning: 'Reasoning',
      created: 'Created',
      analysis: 'AI Analysis',
      decisionType: 'Decision Type',
      biases: 'Potential Cognitive Biases',
      alternatives: 'Overlooked Alternatives',
      insights: 'Additional Insights',
    },
    analysis: {
      attemptCount: 'Analyzed {count} times',
      lastAnalyzed: ' · Last analyzed ',
    },
    states: {
      analyzing: {
        title: 'Analysis in Progress',
        description:
          'Your decision is being analyzed by AI. This usually takes a few seconds...',
      },
      failed: {
        title: 'Analysis Failed',
        description: 'An error occurred while analyzing your decision.',
        retry: 'Retry Analysis',
      },
    },
  },
  filters: {
    label: 'Filter by:',
    clear: 'Clear filters',
    decisionType: {
      label: 'Decision Type',
      selected: '{count} types selected',
    },
    biases: {
      label: 'Biases',
      selected: '{count} biases selected',
    },
    dateRange: {
      from: 'From date',
      to: 'To date',
    },
  },
  sorting: {
    label: 'Sort by:',
    placeholder: 'Select field',
    fields: {
      createdAt: 'Date Created',
      updatedAt: 'Last Updated',
      status: 'Status',
      decisionType: 'Decision Type',
    },
    ascending: 'Sort ascending',
    descending: 'Sort descending',
  },
  // Decision type labels
  decisionTypes: {
    EMOTIONAL: 'Emotional',
    STRATEGIC: 'Strategic',
    IMPULSIVE: 'Impulsive',
    ANALYTICAL: 'Analytical',
    INTUITIVE: 'Intuitive',
    COLLABORATIVE: 'Collaborative',
    RISK_AVERSE: 'Risk Averse',
    RISK_TAKING: 'Risk Taking',
    OTHER: 'Other',
  },
  // Cognitive bias labels
  biases: {
    CONFIRMATION_BIAS: 'Confirmation Bias',
    ANCHORING_BIAS: 'Anchoring Bias',
    AVAILABILITY_HEURISTIC: 'Availability Heuristic',
    SUNK_COST_FALLACY: 'Sunk Cost Fallacy',
    RECENCY_BIAS: 'Recency Bias',
    OVERCONFIDENCE_BIAS: 'Overconfidence Bias',
    HINDSIGHT_BIAS: 'Hindsight Bias',
    STATUS_QUO_BIAS: 'Status Quo Bias',
    LOSS_AVERSION: 'Loss Aversion',
    FRAMING_EFFECT: 'Framing Effect',
    GROUPTHINK: 'Groupthink',
    AUTHORITY_BIAS: 'Authority Bias',
    BANDWAGON_EFFECT: 'Bandwagon Effect',
    DUNNING_KRUGER_EFFECT: 'Dunning-Kruger Effect',
    OPTIMISM_BIAS: 'Optimism Bias',
    NEGATIVITY_BIAS: 'Negativity Bias',
    FUNDAMENTAL_ATTRIBUTION_ERROR: 'Fundamental Attribution Error',
  },
} as const;
