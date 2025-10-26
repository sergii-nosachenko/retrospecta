'use client';

import {
  DatePicker as ArkDatePicker,
  type DateValue,
  parseDate,
} from '@ark-ui/react/date-picker';

import * as React from 'react';
import { LuCalendar, LuChevronLeft, LuChevronRight } from 'react-icons/lu';

import { Box, IconButton, Input, Portal } from '@chakra-ui/react';

export interface DatePickerRootProps extends ArkDatePicker.RootProps {
  size?: 'sm' | 'md' | 'lg';
}

export const DatePickerRoot = React.forwardRef<
  HTMLDivElement,
  DatePickerRootProps
>((props, ref) => {
  return (
    <ArkDatePicker.Root
      ref={ref}
      positioning={{ sameWidth: false }}
      {...props}
    />
  );
});

export const DatePickerLabel = ArkDatePicker.Label;
export const DatePickerControl = ArkDatePicker.Control;

export const DatePickerInput = React.forwardRef<
  HTMLInputElement,
  ArkDatePicker.InputProps
>((props, ref) => {
  return (
    <ArkDatePicker.Input asChild ref={ref} {...props}>
      <Input />
    </ArkDatePicker.Input>
  );
});

export const DatePickerTrigger = React.forwardRef<
  HTMLButtonElement,
  ArkDatePicker.TriggerProps
>((props, ref) => {
  return (
    <ArkDatePicker.Trigger asChild ref={ref} {...props}>
      <IconButton variant="outline" size="sm">
        <LuCalendar />
      </IconButton>
    </ArkDatePicker.Trigger>
  );
});

export const DatePickerContent = React.forwardRef<
  HTMLDivElement,
  ArkDatePicker.ContentProps
>((props, ref) => {
  const { children, ...rest } = props;
  return (
    <Portal>
      <Box position="fixed" inset={0} pointerEvents="none" zIndex={2000}>
        <Box pointerEvents="auto">
          <ArkDatePicker.Positioner>
            <ArkDatePicker.Content ref={ref} {...rest}>
              <Box
                bg="bg"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="border"
                boxShadow="lg"
                p={4}
              >
                {children}
              </Box>
            </ArkDatePicker.Content>
          </ArkDatePicker.Positioner>
        </Box>
      </Box>
    </Portal>
  );
});

export const DatePickerView = ArkDatePicker.View;
export const DatePickerViewControl = ArkDatePicker.ViewControl;
export const DatePickerContext = ArkDatePicker.Context;

export const DatePickerPrevTrigger = React.forwardRef<
  HTMLButtonElement,
  ArkDatePicker.PrevTriggerProps
>((props, ref) => {
  return (
    <ArkDatePicker.PrevTrigger asChild ref={ref} {...props}>
      <IconButton variant="ghost" size="sm">
        <LuChevronLeft />
      </IconButton>
    </ArkDatePicker.PrevTrigger>
  );
});

export const DatePickerNextTrigger = React.forwardRef<
  HTMLButtonElement,
  ArkDatePicker.NextTriggerProps
>((props, ref) => {
  return (
    <ArkDatePicker.NextTrigger asChild ref={ref} {...props}>
      <IconButton variant="ghost" size="sm">
        <LuChevronRight />
      </IconButton>
    </ArkDatePicker.NextTrigger>
  );
});

export const DatePickerViewTrigger = React.forwardRef<
  HTMLButtonElement,
  ArkDatePicker.ViewTriggerProps
>((props, ref) => {
  return (
    <ArkDatePicker.ViewTrigger asChild ref={ref} {...props}>
      <IconButton variant="ghost" size="sm">
        {props.children}
      </IconButton>
    </ArkDatePicker.ViewTrigger>
  );
});

export const DatePickerRangeText = ArkDatePicker.RangeText;
export const DatePickerTable = ArkDatePicker.Table;
export const DatePickerTableHead = ArkDatePicker.TableHead;
export const DatePickerTableBody = ArkDatePicker.TableBody;
export const DatePickerTableRow = ArkDatePicker.TableRow;

export const DatePickerTableHeader = React.forwardRef<
  HTMLTableCellElement,
  ArkDatePicker.TableHeaderProps
>((props, ref) => {
  return (
    <ArkDatePicker.TableHeader ref={ref} {...props}>
      <Box
        as="span"
        color="fg.muted"
        fontWeight="semibold"
        fontSize="sm"
        h={10}
      >
        {props.children}
      </Box>
    </ArkDatePicker.TableHeader>
  );
});

export const DatePickerTableCell = React.forwardRef<
  HTMLTableCellElement,
  ArkDatePicker.TableCellProps
>((props, ref) => {
  return <ArkDatePicker.TableCell ref={ref} {...props} />;
});

export const DatePickerTableCellTrigger = React.forwardRef<
  HTMLDivElement,
  ArkDatePicker.TableCellTriggerProps
>((props, ref) => {
  return (
    <ArkDatePicker.TableCellTrigger
      ref={ref}
      {...props}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        height: '2.5rem',
        width: '2.5rem',
        transition: 'all 0.2s',
        ...props.style,
      }}
    />
  );
});

export const DatePickerClearTrigger = React.forwardRef<
  HTMLButtonElement,
  ArkDatePicker.ClearTriggerProps
>((props, ref) => {
  return (
    <ArkDatePicker.ClearTrigger asChild ref={ref} {...props}>
      <IconButton variant="ghost" size="sm">
        Clear
      </IconButton>
    </ArkDatePicker.ClearTrigger>
  );
});

// Export DateValue type and utilities for consumers
export type { DateValue };
export { parseDate };
