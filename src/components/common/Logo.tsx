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

/**
 * Individual logo icon component with color theming support.
 *
 * @param icon - The React icon component to render
 * @param color - The color for light mode
 * @param darkColor - The color for dark mode
 * @param size - The font size for the icon
 */
const LogoIcon = memo(({ icon, color, darkColor, size }: LogoIconProps) => (
  <Box color={color} _dark={{ color: darkColor }} fontSize={size}>
    {icon}
  </Box>
));

LogoIcon.displayName = 'LogoIcon';

/**
 * Application logo component featuring three iconic symbols.
 *
 * Displays a horizontal group of three icons (Target, Brain, Lightbulb) representing
 * the application's focus on goals, thinking, and ideas. Each icon has distinct colors
 * that adapt to light and dark mode. Optimized with React.memo for performance.
 *
 * @param size - Optional size for the logo icons. Accepts Chakra UI fontSize values (default: "2xl")
 *
 * @example
 * ```tsx
 * <Logo />
 * <Logo size="3xl" />
 * <Logo size="xl" />
 * ```
 */
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
