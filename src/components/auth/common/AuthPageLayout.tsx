import { Box, Card, Heading, Stack, Text } from '@chakra-ui/react';
import { type ReactNode, memo } from 'react';

interface AuthPageLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/**
 * Reusable layout component for authentication pages.
 *
 * Provides consistent styling and structure for all authentication-related pages
 * (login, register, confirm email, etc.). Features a centered card layout with
 * full-height viewport, title, subtitle, and support for light/dark mode.
 * Optimized with React.memo for performance.
 *
 * @param title - The main heading text displayed at the top of the auth page
 * @param subtitle - Supporting text displayed below the title
 * @param children - Child components to render within the auth page layout (forms, buttons, etc.)
 *
 * @example
 * ```tsx
 * <AuthPageLayout title="Welcome Back" subtitle="Sign in to continue">
 *   <LoginForm />
 * </AuthPageLayout>
 * ```
 */
export const AuthPageLayout = memo(
  ({ title, subtitle, children }: AuthPageLayoutProps) => {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
        _dark={{ bg: 'gray.900' }}
        p={4}
      >
        <Card.Root maxW="md" w="full" p={8}>
          <Stack gap={6}>
            <Stack gap={2} textAlign="center">
              <Heading size="2xl">{title}</Heading>
              <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                {subtitle}
              </Text>
            </Stack>
            {children}
          </Stack>
        </Card.Root>
      </Box>
    );
  }
);

AuthPageLayout.displayName = 'AuthPageLayout';
