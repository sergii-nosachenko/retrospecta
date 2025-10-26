'use client';

import { Combobox as ChakraCombobox, Portal } from '@chakra-ui/react';
import * as React from 'react';

import { CloseButton } from './close-button';

interface ComboboxControlProps extends ChakraCombobox.ControlProps {
  clearable?: boolean;
}

export const ComboboxControl = React.forwardRef<
  HTMLDivElement,
  ComboboxControlProps
>((props, ref) => {
  const { children, clearable, ...rest } = props;
  return (
    <ChakraCombobox.Control {...rest} ref={ref}>
      {children}
      <ChakraCombobox.IndicatorGroup>
        {clearable && <ComboboxClearTrigger />}
        <ChakraCombobox.Trigger />
      </ChakraCombobox.IndicatorGroup>
    </ChakraCombobox.Control>
  );
});

const ComboboxClearTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraCombobox.ClearTriggerProps
>((props, ref) => {
  return (
    <ChakraCombobox.ClearTrigger asChild {...props} ref={ref}>
      <CloseButton
        size="xs"
        variant="plain"
        focusVisibleRing="inside"
        focusRingWidth="2px"
        pointerEvents="auto"
      />
    </ChakraCombobox.ClearTrigger>
  );
});

interface ComboboxContentProps extends ChakraCombobox.ContentProps {
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement | null>;
}

export const ComboboxContent = React.forwardRef<
  HTMLDivElement,
  ComboboxContentProps
>((props, ref) => {
  const { portalled = true, portalRef, ...rest } = props;
  return (
    <Portal disabled={!portalled} container={portalRef}>
      <ChakraCombobox.Positioner>
        <ChakraCombobox.Content {...rest} ref={ref} />
      </ChakraCombobox.Positioner>
    </Portal>
  );
});

export const ComboboxItem = React.forwardRef<
  HTMLDivElement,
  ChakraCombobox.ItemProps
>((props, ref) => {
  const { item, children, ...rest } = props;
  return (
    <ChakraCombobox.Item key={item.value} item={item} {...rest} ref={ref}>
      {children}
      <ChakraCombobox.ItemIndicator />
    </ChakraCombobox.Item>
  );
});

export const ComboboxRoot = React.forwardRef<
  HTMLDivElement,
  ChakraCombobox.RootProps
>((props, ref) => {
  return (
    <ChakraCombobox.Root
      {...props}
      ref={ref}
      positioning={{ sameWidth: true, ...props.positioning }}
    />
  );
}) as ChakraCombobox.RootComponent;

interface ComboboxItemGroupProps extends ChakraCombobox.ItemGroupProps {
  label: React.ReactNode;
}

export const ComboboxItemGroup = React.forwardRef<
  HTMLDivElement,
  ComboboxItemGroupProps
>((props, ref) => {
  const { children, label, ...rest } = props;
  return (
    <ChakraCombobox.ItemGroup {...rest} ref={ref}>
      <ChakraCombobox.ItemGroupLabel>{label}</ChakraCombobox.ItemGroupLabel>
      {children}
    </ChakraCombobox.ItemGroup>
  );
});

export const ComboboxLabel = ChakraCombobox.Label;
export const ComboboxInput = ChakraCombobox.Input;
export const ComboboxEmpty = ChakraCombobox.Empty;
export const ComboboxItemText = ChakraCombobox.ItemText;
