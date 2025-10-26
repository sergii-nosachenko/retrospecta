'use client';

import { Box, Group } from '@chakra-ui/react';
import { memo, useMemo } from 'react';
import { LuBrain, LuLightbulb, LuTarget } from 'react-icons/lu';


const PULSE_KEYFRAMES = `
  @keyframes pulse1 {
    0%, 100% { filter: blur(24px); }
    50% { filter: blur(2px); }
  }
  @keyframes pulse2 {
    0%, 100% { filter: blur(24px); }
    50% { filter: blur(2px); }
  }
  @keyframes pulse3 {
    0%, 100% { filter: blur(24px); }
    50% { filter: blur(2px); }
  }
`;

const ICON_STYLES = `
  .icon-reveal {
    font-size: 4rem;
    cursor: pointer;
    opacity: 0.6;
    transition: filter 0.3s ease-in-out, opacity 0.3s ease-in-out;
  }
  @media (min-width: 480px) {
    .icon-reveal {
      font-size: 5rem;
    }
  }
  @media (min-width: 768px) {
    .icon-reveal {
      font-size: 6rem;
    }
  }
  @media (min-width: 1024px) {
    .icon-reveal {
      font-size: 8rem;
    }
  }
  .icon-reveal:hover {
    filter: blur(0px) !important;
    opacity: 1;
    animation-play-state: paused !important;
  }
`;

interface AnimatedIconProps {
  icon: React.ReactNode;
  animation: string;
  color: string;
  darkColor: string;
}

const AnimatedIcon = memo(
  ({ icon, animation, color, darkColor }: AnimatedIconProps) => {
    const animationStyle = useMemo(
      () => ({
        animation,
      }),
      [animation]
    );

    return (
      <Box
        className="icon-reveal"
        css={animationStyle}
        color={color}
        _dark={{ color: darkColor }}
      >
        {icon}
      </Box>
    );
  }
);

AnimatedIcon.displayName = 'AnimatedIcon';

const IconStyles = memo(() => (
  <>
    <style>{PULSE_KEYFRAMES}</style>
    <style>{ICON_STYLES}</style>
  </>
));

IconStyles.displayName = 'IconStyles';

export const IconReveal = memo(() => {
  return (
    <>
      <IconStyles />
      <Group
        gap={{ base: 4, sm: 6, md: 8 }}
        justifyContent="center"
        mb={{ base: 4, md: 6 }}
      >
        <AnimatedIcon
          icon={<LuTarget />}
          animation="pulse1 8.4s ease-in-out infinite"
          color="blue.500"
          darkColor="blue.400"
        />
        <AnimatedIcon
          icon={<LuBrain />}
          animation="pulse2 11.4s ease-in-out infinite"
          color="purple.500"
          darkColor="purple.400"
        />
        <AnimatedIcon
          icon={<LuLightbulb />}
          animation="pulse3 7.8s ease-in-out infinite"
          color="yellow.500"
          darkColor="yellow.400"
        />
      </Group>
    </>
  );
});

IconReveal.displayName = 'IconReveal';
