'use client';

import {
  Badge,
  Box,
  Card,
  Heading,
  Skeleton,
  SkeletonText,
  Stack,
  VStack,
} from '@chakra-ui/react';

import { DecisionFormModal } from '@/components/decisions/DecisionFormModal';
import { DecisionList } from '@/components/decisions/DecisionList';
import { useDecisionStream } from '@/hooks/useDecisionStream';

export default function DecisionsPage() {
  const { decisions, isConnected, isLoading, error, pendingCount } =
    useDecisionStream();

  return (
    <Box p={{ base: 5, md: 8 }} maxW="7xl" mx="auto">
      <Stack
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'start', sm: 'center' }}
        mb={8}
        gap={4}
      >
        <Stack direction="row" align="center" gap={3} flexWrap="wrap">
          <Heading size="2xl">Your Decisions</Heading>
          {/* Connection status indicator */}
          <Badge
            colorPalette={isConnected ? 'green' : 'gray'}
            size="sm"
            variant="subtle"
            px={3}
            py={1}
          >
            {isConnected ? '● Live' : '○ Offline'}
          </Badge>
          {/* Pending count indicator */}
          {pendingCount > 0 && (
            <Badge colorPalette="blue" size="sm" variant="subtle" px={3} py={1}>
              {pendingCount} analyzing...
            </Badge>
          )}
        </Stack>
        <DecisionFormModal />
      </Stack>

      {error ? (
        <Box
          p={8}
          textAlign="center"
          borderWidth="1px"
          borderRadius="lg"
          borderStyle="dashed"
          borderColor="red.300"
          bg="red.50"
          _dark={{ bg: 'red.900/20', borderColor: 'red.800' }}
        >
          {error}
        </Box>
      ) : isLoading ? (
        <VStack gap={5} align="stretch">
          {/* Skeleton cards for loading state */}
          {[1, 2, 3].map((i) => (
            <Card.Root key={i}>
              <Card.Body p={6}>
                <Stack gap={4}>
                  <Stack direction="row" justify="space-between" align="center">
                    <Skeleton height="24px" width="100px" />
                    <Skeleton height="16px" width="120px" />
                  </Stack>

                  <Box>
                    <Skeleton height="16px" width="60px" mb={2} />
                    <SkeletonText noOfLines={2} gap={2} />
                  </Box>

                  <Box>
                    <Skeleton height="16px" width="60px" mb={2} />
                    <SkeletonText noOfLines={3} gap={2} />
                  </Box>
                </Stack>
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>
      ) : (
        <DecisionList decisions={decisions} />
      )}
    </Box>
  );
}
