import { Status as ChakraStatus } from '@chakra-ui/react';
import * as React from 'react';

import { StatusValue } from '@/types/enums';

import type { ColorPalette } from '@chakra-ui/react';


export interface StatusProps extends ChakraStatus.RootProps {
  value?: StatusValue;
}

const statusMap: Record<StatusValue, ColorPalette> = {
  [StatusValue.SUCCESS]: 'green',
  [StatusValue.ERROR]: 'red',
  [StatusValue.WARNING]: 'orange',
  [StatusValue.INFO]: 'blue',
};

export const Status = React.forwardRef<HTMLDivElement, StatusProps>(
  (props, ref) => {
    const { children, value = StatusValue.INFO, ...rest } = props;
    const colorPalette = rest.colorPalette ?? statusMap[value];
    return (
      <ChakraStatus.Root ref={ref} {...rest} colorPalette={colorPalette}>
        <ChakraStatus.Indicator />
        {children}
      </ChakraStatus.Root>
    );
  }
);
