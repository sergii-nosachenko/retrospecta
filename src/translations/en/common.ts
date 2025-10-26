export const common = {
  app: {
    name: 'Retrospecta',
    tagline: 'AI-Powered Decision Journal',
  },
  actions: {
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    refresh: 'Refresh',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    getStarted: 'Get Started',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    back: 'Back to Decisions',
    backToDashboard: 'Back to decisions',
    creating: 'Creating...',
    retrying: 'Retrying...',
  },
  navigation: {
    dashboard: 'Dashboard',
    decisions: 'Your Decisions',
  },
  theme: {
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
  },
  menu: {
    userMenu: 'User menu',
  },
  errors: {
    validation: 'Validation Error',
    generic: 'Error',
    unexpected: 'An unexpected error occurred',
  },
} as const;
