import { forwardRef, useState } from 'react';
import type { TextInput as RNTextInput } from 'react-native';

import { TextInput, type TextInputProps } from './TextInput';

export interface SearchProps
  extends Omit<TextInputProps, 'leftIcon' | 'rightIcon' | 'onRightIconPress'> {
  readonly value?: string;
  readonly onClear?: () => void;
}

export const Search = forwardRef<RNTextInput, SearchProps>(function Search(
  { value, onClear, onChangeText, ...rest },
  ref,
) {
  const [internalValue, setInternalValue] = useState('');
  const current = value ?? internalValue;
  const showClear = current.length > 0 && !!onClear;

  return (
    <TextInput
      ref={ref}
      {...rest}
      value={value}
      onChangeText={(t) => {
        setInternalValue(t);
        onChangeText?.(t);
      }}
      returnKeyType={rest.returnKeyType ?? 'search'}
      autoCorrect={false}
      autoCapitalize={rest.autoCapitalize ?? 'none'}
      leftIcon="search"
      rightIcon={showClear ? 'x' : undefined}
      onRightIconPress={showClear ? onClear : undefined}
    />
  );
});
