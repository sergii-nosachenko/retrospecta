import * as React from 'react';
import { LuX } from 'react-icons/lu';

import { IconButton as ChakraIconButton } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';

export type CloseButtonProps = ButtonProps;

export const CloseButton = React.forwardRef<
  HTMLButtonElement,
  CloseButtonProps
>((props, ref) => {
  return (
    <ChakraIconButton variant="ghost" aria-label="Close" ref={ref} {...props}>
      {props.children ?? <LuX />}
    </ChakraIconButton>
  );
});
