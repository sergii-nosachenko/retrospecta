import { Box, Group } from '@chakra-ui/react';
import { memo } from 'react';
import { LuBrain, LuLightbulb, LuTarget } from 'react-icons/lu';


interface LogoProps {
  size?: string;
}

interface LogoIconProps {
  icon: React.ReactNode;
  color: string;
  darkColor: string;
  size: string;
}

const LogoIcon = memo(({ icon, color, darkColor, size }: LogoIconProps) => (
  <Box color={color} _dark={{ color: darkColor }} fontSize={size}>
    {icon}
  </Box>
));

LogoIcon.displayName = 'LogoIcon';

export const Logo = memo(({ size = '2xl' }: LogoProps) => {
  return (
    <Group gap={2} justifyContent="center">
      <LogoIcon
        icon={<LuTarget />}
        color="blue.500"
        darkColor="blue.400"
        size={size}
      />
      <LogoIcon
        icon={<LuBrain />}
        color="purple.500"
        darkColor="purple.400"
        size={size}
      />
      <LogoIcon
        icon={<LuLightbulb />}
        color="yellow.500"
        darkColor="yellow.400"
        size={size}
      />
    </Group>
  );
});

Logo.displayName = 'Logo';
