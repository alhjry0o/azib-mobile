import { forwardRef } from 'react';
import type { TextInput as RNTextInput } from 'react-native';

import { useTheme } from '@/theme';

import { TextInput, type TextInputProps } from './TextInput';

export interface TextareaProps extends Omit<TextInputProps, 'size'> {
  /** Minimum height in dp. Default 96. */
  readonly minHeight?: number;
}

export const Textarea = forwardRef<RNTextInput, TextareaProps>(function Textarea(
  { minHeight = 96, ...rest },
  ref,
) {
  const theme = useTheme();
  return (
    <TextInput
      ref={ref}
      {...rest}
      multiline
      textAlignVertical="top"
      containerStyle={[
        { height: undefined, minHeight, alignItems: 'flex-start' },
        rest.containerStyle,
      ]}
      inputStyle={[
        { minHeight: minHeight - theme.spacing[4], paddingTop: theme.spacing[3] },
        rest.inputStyle,
      ]}
    />
  );
});
