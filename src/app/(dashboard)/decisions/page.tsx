import { Box, Heading, Text } from '@chakra-ui/react';

export default function DecisionsPage() {
  return (
    <Box p={8}>
      <Heading mb={4}>Your Decisions</Heading>
      <Text color="gray.600" _dark={{ color: 'gray.400' }}>
        Decision history will appear here.
      </Text>
    </Box>
  );
}
