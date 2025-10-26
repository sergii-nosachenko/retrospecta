import * as React from 'react';

import { Timeline as ChakraTimeline } from '@chakra-ui/react';

export const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  ChakraTimeline.IndicatorProps
>((props, ref) => {
  return (
    <ChakraTimeline.Connector ref={ref}>
      <ChakraTimeline.Separator />
      <ChakraTimeline.Indicator {...props} />
    </ChakraTimeline.Connector>
  );
});

export const TimelineRoot = ChakraTimeline.Root;
export const TimelineContent = ChakraTimeline.Content;
export const TimelineItem = ChakraTimeline.Item;
export const TimelineIndicator = ChakraTimeline.Indicator;
export const TimelineTitle = ChakraTimeline.Title;
export const TimelineDescription = ChakraTimeline.Description;
