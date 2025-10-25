'use client';

import { LuBrain, LuLightbulb, LuTarget } from 'react-icons/lu';

import { Box, Group } from '@chakra-ui/react';

const pulseKeyframes = `
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

const iconStyles = `
  .icon-reveal {
    font-size: 8rem;
    cursor: pointer;
    opacity: 0.6;
    transition: filter 0.3s ease-in-out, opacity 0.3s ease-in-out;
  }
  .icon-reveal:hover {
    filter: blur(0px) !important;
    opacity: 1;
    animation-play-state: paused !important;
  }
`;

export function IconReveal() {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <style>{iconStyles}</style>
      <Group gap={8} justifyContent="center" mb={6}>
        <Box
          className="icon-reveal"
          css={{
            animation: 'pulse1 8.4s ease-in-out infinite',
          }}
          color="blue.500"
          _dark={{ color: 'blue.400' }}
        >
          <LuTarget />
        </Box>
        <Box
          className="icon-reveal"
          css={{
            animation: 'pulse2 11.4s ease-in-out infinite',
          }}
          color="purple.500"
          _dark={{ color: 'purple.400' }}
        >
          <LuBrain />
        </Box>
        <Box
          className="icon-reveal"
          css={{
            animation: 'pulse3 7.8s ease-in-out infinite',
          }}
          color="yellow.500"
          _dark={{ color: 'yellow.400' }}
        >
          <LuLightbulb />
        </Box>
      </Group>
    </>
  );
}
