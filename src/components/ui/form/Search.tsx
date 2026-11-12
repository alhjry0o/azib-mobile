import { forwardRef, useState } from 'react';
import type { TextInput as RNTextInput } from 'react-native';

import { useTheme } from '@/theme';

import { Icon } from '../Icon';
import { TextInput, type TextInputProps } from './TextInput';

export interface SearchProps extends Omit<TextInputProps, 'leftIcon' | 'rightIcon' | 'onRightIconPress'> {
  readonly value?: string;
  readonly onClear?: () => void;
}

export const Search = forwardRef<RNTextInput, SearchProps>(function Search(
  { value, onClear, ...rest },
  ref,
) {
  const theme = useTheme();
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
        rest.onChangeText?.(t);
      }}
      returnKeyType={rest.returnKeyType ?? 'search'}
      autoCorrect={false}
      autoCapitalize={rest.autoCapitalize ?? 'none'}
      leftIcon="search"
      rightIcon={showClear ? 'x' : undefined}
      onRightIconPress={showClear ? onClear : undefined}
      placeholder={rest.placeholder}
      inputStyle={[{ color: theme.colors.text.primary }, rest.inputStyle]}
    />
  );
});
