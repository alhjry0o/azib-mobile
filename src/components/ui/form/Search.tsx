import { forwardRef, useState, type ElementRef } from 'react';

import { TextInput, type TextInputProps } from './TextInput';

export interface SearchProps
  extends Omit<TextInputProps, 'leftIcon' | 'rightIcon' | 'onRightIconPress'> {
  readonly value?: string;
  readonly onClear?: () => void;
}

export const Search = forwardRef<ElementRef<typeof TextInput>, SearchProps>(function Search(
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
