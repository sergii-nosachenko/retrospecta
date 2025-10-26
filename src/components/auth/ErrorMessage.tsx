import { Box, Text } from '@chakra-ui/react';
import { memo } from 'react';


interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = memo(({ message }: ErrorMessageProps) => {
  return (
    <Box
      p={3}
      borderRadius="md"
      bg="red.500/10"
      borderWidth="1px"
      borderColor="red.500"
    >
      <Text color="red.500" fontSize="sm">
        {message}
      </Text>
    </Box>
  );
});

ErrorMessage.displayName = 'ErrorMessage';
