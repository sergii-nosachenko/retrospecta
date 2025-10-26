'use client';

import * as React from 'react';

import { TagsInput as ChakraTagsInput } from '@chakra-ui/react';

import { CloseButton } from './close-button';

interface TagsInputControlProps extends ChakraTagsInput.ControlProps {
  clearable?: boolean;
}

export const TagsInputControl = React.forwardRef<
  HTMLDivElement,
  TagsInputControlProps
>((props, ref) => {
  const { children, clearable, ...rest } = props;
  return (
    <ChakraTagsInput.Control {...rest} ref={ref}>
      {children}
      {clearable && <TagsInputClearTrigger />}
    </ChakraTagsInput.Control>
  );
});

const TagsInputClearTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraTagsInput.ClearTriggerProps
>((props, ref) => {
  return (
    <ChakraTagsInput.ClearTrigger asChild {...props} ref={ref}>
      <CloseButton
        size="xs"
        variant="plain"
        focusVisibleRing="inside"
        focusRingWidth="2px"
        pointerEvents="auto"
      />
    </ChakraTagsInput.ClearTrigger>
  );
});

export const TagsInputItem = React.forwardRef<
  HTMLDivElement,
  ChakraTagsInput.ItemProps
>((props, ref) => {
  const { children, ...rest } = props;
  return (
    <ChakraTagsInput.Item {...rest} ref={ref}>
      <ChakraTagsInput.ItemText>{children}</ChakraTagsInput.ItemText>
      <ChakraTagsInput.ItemDeleteTrigger asChild>
        <CloseButton
          size="2xs"
          variant="plain"
          focusVisibleRing="inside"
          focusRingWidth="2px"
          pointerEvents="auto"
        />
      </ChakraTagsInput.ItemDeleteTrigger>
    </ChakraTagsInput.Item>
  );
});

export const TagsInputRoot = React.forwardRef<
  HTMLDivElement,
  ChakraTagsInput.RootProps
>((props, ref) => {
  return <ChakraTagsInput.Root {...props} ref={ref} />;
}) as ChakraTagsInput.RootProps;

export const TagsInputItemText = ChakraTagsInput.ItemText;
export const TagsInputItemPreview = ChakraTagsInput.ItemPreview;
export const TagsInputItemInput = ChakraTagsInput.ItemInput;
export const TagsInputItemContext = ChakraTagsInput.ItemContext;
export const TagsInputRootProvider = ChakraTagsInput.RootProvider;
export const TagsInputPropsProvider = ChakraTagsInput.PropsProvider;
export const TagsInputLabel = ChakraTagsInput.Label;
export const TagsInputInput = ChakraTagsInput.Input;
export const TagsInputContext = ChakraTagsInput.Context;
export const TagsInputHiddenInput = ChakraTagsInput.HiddenInput;
