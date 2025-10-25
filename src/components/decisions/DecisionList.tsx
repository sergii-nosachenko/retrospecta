'use client';

import { useState } from 'react';

import { Badge, Box, Card, Stack, Text, VStack } from '@chakra-ui/react';

import { EmptyState } from '@/components/ui/empty-state';

import { DecisionDetailModal } from './DecisionDetailModal';

interface Decision {
  id: string;
  situation: string;
  decision: string;
  reasoning: string | null;
  status: string;
  category: string | null;
  biases: string[];
  alternatives: string | null;
  insights: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DecisionListProps {
  decisions: Decision[];
}

export function DecisionList({ decisions }: DecisionListProps) {
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (decisions.length === 0) {
    return (
      <EmptyState
        title="No decisions yet"
        description="Start recording your decisions to receive AI-powered insights about your decision-making patterns."
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'PENDING':
        return 'yellow';
      case 'PROCESSING':
        return 'blue';
      case 'FAILED':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return null;

    return category
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleDecisionClick = (decisionId: string) => {
    setSelectedDecisionId(decisionId);
    setIsModalOpen(true);
  };

  return (
    <>
      <VStack gap={5} align="stretch">
        {decisions.map((decision) => (
          <Card.Root
            key={decision.id}
            _hover={{ shadow: 'md', cursor: 'pointer' }}
            transition="all 0.2s"
            onClick={() => handleDecisionClick(decision.id)}
          >
            <Card.Body p={6}>
              <Stack gap={4}>
                <Stack
                  direction={{ base: 'column', sm: 'row' }}
                  justify="space-between"
                  align={{ base: 'start', sm: 'center' }}
                  gap={3}
                >
                  <Badge
                    colorPalette={getStatusColor(decision.status)}
                    px={3}
                    py={1}
                  >
                    {decision.status}
                  </Badge>
                  <Text
                    fontSize="sm"
                    color="gray.500"
                    _dark={{ color: 'gray.400' }}
                  >
                    {new Date(decision.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </Stack>

                <Box>
                  <Text
                    fontWeight="semibold"
                    mb={2}
                    fontSize="sm"
                    color="gray.600"
                    _dark={{ color: 'gray.400' }}
                  >
                    Decision
                  </Text>
                  <Text fontSize="lg" fontWeight="medium" lineHeight="1.6">
                    {truncateText(decision.decision, 150)}
                  </Text>
                </Box>

                <Box>
                  <Text
                    fontWeight="semibold"
                    mb={2}
                    fontSize="sm"
                    color="gray.600"
                    _dark={{ color: 'gray.400' }}
                  >
                    Situation
                  </Text>
                  <Text
                    color="gray.700"
                    _dark={{ color: 'gray.300' }}
                    lineHeight="1.6"
                  >
                    {truncateText(decision.situation, 200)}
                  </Text>
                </Box>

                {decision.status === 'COMPLETED' && decision.category && (
                  <Stack direction="row" gap={2} flexWrap="wrap" pt={2}>
                    <Badge colorPalette="blue" size="sm" px={3} py={1}>
                      {getCategoryLabel(decision.category)}
                    </Badge>
                    {decision.biases.slice(0, 3).map((bias, index) => (
                      <Badge
                        key={index}
                        colorPalette="orange"
                        size="sm"
                        px={3}
                        py={1}
                      >
                        {bias}
                      </Badge>
                    ))}
                    {decision.biases.length > 3 && (
                      <Badge colorPalette="gray" size="sm" px={3} py={1}>
                        +{decision.biases.length - 3} more
                      </Badge>
                    )}
                  </Stack>
                )}
              </Stack>
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>

      {/* Decision Detail Modal */}
      {selectedDecisionId && (
        <DecisionDetailModal
          decisionId={selectedDecisionId}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  );
}
