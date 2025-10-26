export const validation = {
  general: {
    invalidInput: 'Invalid input',
    requiredFields: 'Please complete all required fields',
  },
  decision: {
    situationRequired: 'Please describe the situation',
    situationMinLength: 'Situation must be at least 10 characters',
    decisionRequired: 'Please describe your decision',
    decisionMinLength: 'Decision must be at least 5 characters',
    bothRequired: 'Please fill in both situation and decision fields',
  },
} as const;
