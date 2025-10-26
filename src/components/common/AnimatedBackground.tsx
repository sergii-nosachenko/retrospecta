'use client';

import { Box } from '@chakra-ui/react';
import { type ReactNode, memo, useMemo } from 'react';


interface AuroraBackgroundProps {
  children?: ReactNode;
  showRadialGradient?: boolean;
}

const CSS_VARIABLES = {
  '--aurora':
    'repeating-linear-gradient(100deg,#3b82f6 10%,#a5b4fc 15%,#93c5fd 20%,#ddd6fe 25%,#60a5fa 30%)',
  '--dark-gradient':
    'repeating-linear-gradient(100deg,#000 0%,#000 7%,transparent 10%,transparent 12%,#000 16%)',
  '--white-gradient':
    'repeating-linear-gradient(100deg,#fff 0%,#fff 7%,transparent 10%,transparent 12%,#fff 16%)',
} as const;

const AuroraLayer = memo(({ showRadialGradient }: AuroraBackgroundProps) => {
  const maskImage = useMemo(
    () =>
      showRadialGradient
        ? 'radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)'
        : undefined,
    [showRadialGradient]
  );

  return (
    <Box
      position="absolute"
      inset="-10px"
      pointerEvents="none"
      opacity={0.5}
      willChange="transform"
      css={{
        backgroundImage: 'var(--white-gradient), var(--aurora)',
        backgroundSize: '300%, 200%',
        backgroundPosition: '50% 50%, 50% 50%',
        filter: 'blur(10px) invert(1)',
        animation: 'aurora 60s linear infinite',
        maskImage,
        WebkitMaskImage: maskImage,
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: 'var(--white-gradient), var(--aurora)',
          backgroundSize: '200%, 100%',
          backgroundAttachment: 'fixed',
          mixBlendMode: 'difference',
        },
        '@media (prefers-color-scheme: dark)': {
          backgroundImage: 'var(--dark-gradient), var(--aurora)',
          filter: 'blur(10px)',
          '&::after': {
            backgroundImage: 'var(--dark-gradient), var(--aurora)',
          },
        },
      }}
    />
  );
});

AuroraLayer.displayName = 'AuroraLayer';

export const AnimatedBackground = memo(
  ({ children, showRadialGradient = true }: AuroraBackgroundProps) => {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        width="100%"
        height="100%"
        overflow="hidden"
        zIndex={-1}
        pointerEvents="none"
        bg="zinc.50"
        _dark={{ bg: 'zinc.900' }}
      >
        <Box
          position="absolute"
          inset={0}
          overflow="hidden"
          css={CSS_VARIABLES}
        >
          <AuroraLayer showRadialGradient={showRadialGradient} />
        </Box>
        {children}
      </Box>
    );
  }
);

AnimatedBackground.displayName = 'AnimatedBackground';
