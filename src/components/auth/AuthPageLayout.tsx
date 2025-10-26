import { type ReactNode, memo } from 'react';

import { Box, Card, Heading, Stack, Text } from '@chakra-ui/react';

interface AuthPageLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

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
