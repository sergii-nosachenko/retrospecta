import { LuBrain, LuLightbulb, LuTarget } from 'react-icons/lu';

import { Box, Group } from '@chakra-ui/react';

interface LogoProps {
  size?: string;
}

export function Logo({ size = '2xl' }: LogoProps) {
  return (
    <Group gap={2} justifyContent="center">
      <Box color="blue.500" _dark={{ color: 'blue.400' }} fontSize={size}>
        <LuTarget />
      </Box>
      <Box color="purple.500" _dark={{ color: 'purple.400' }} fontSize={size}>
        <LuBrain />
      </Box>
      <Box color="yellow.500" _dark={{ color: 'yellow.400' }} fontSize={size}>
        <LuLightbulb />
      </Box>
    </Group>
  );
}
