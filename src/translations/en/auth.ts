export const auth = {
  login: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your Retrospecta account',
    orContinueWith: 'Or continue with email',
    noAccount: "Don't have an account?",
    signUpLink: 'Sign up',
    form: {
      email: {
        label: 'Email',
        placeholder: 'you@example.com',
      },
      password: {
        label: 'Password',
        placeholder: 'Your password',
      },
      submit: 'Sign In',
    },
  },
  register: {
    title: 'Create Account',
    subtitle: 'Start your decision-making journey',
    orRegisterWith: 'Or register with email',
    hasAccount: 'Already have an account?',
    signInLink: 'Sign in',
    form: {
      name: {
        label: 'Name',
        placeholder: 'Your name',
      },
      email: {
        label: 'Email',
        placeholder: 'you@example.com',
      },
      password: {
        label: 'Password',
        placeholder: 'Choose a password',
      },
      submit: 'Sign Up',
    },
  },
  oauth: {
    google: 'Continue with Google',
  },
} as const;
