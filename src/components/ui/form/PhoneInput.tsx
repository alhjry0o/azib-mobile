import { forwardRef, useMemo, type ElementRef } from 'react';

import { StyleSheet, View } from 'react-native';

import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';

import { Text } from '../Text';
import { Field } from './Field';
import { TextInput, type TextInputProps } from './TextInput';

export interface PhoneInputProps extends Omit<TextInputProps, 'leftIcon' | 'onChangeText' | 'keyboardType'> {
  /** Digits only (no prefix). Yemen +967 expected. */
  readonly value: string;
  /** Called with digits-only string (no prefix). */
  readonly onChangeText: (digitsOnly: string) => void;
  /** Default '+967'. */
  readonly countryCode?: string;
}

/**
 * Simplified Yemen-context phone input.
 * - Fixed prefix (default +967) shown on the start side.
 * - Numeric digits only (max 9 for Yemen without country code).
 * - No country picker (P06 will add multi-country support).
 */
export const PhoneInput = forwardRef<ElementRef<typeof TextInput>, PhoneInputProps>(function PhoneInput(
  { value, onChangeText, countryCode = '+967', ...rest },
  ref,
) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const cleanValue = useMemo(() => value.replace(/\D/g, '').slice(0, 9), [value]);

  return (
    <Field
      label={rest.label}
      required={rest.required}
      helpText={rest.helpText}
      errorText={rest.errorText}
      disabled={rest.disabled}
      testID={rest.testID ? `${rest.testID}-field` : undefined}
    >
      <View
        style={[
          styles.wrapper,
          {
            borderColor: rest.error || rest.errorText
              ? theme.colors.state.danger
              : theme.colors.border.subtle,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.bg.surface,
          },
        ]}
      >
        <View style={styles.prefix}>
          <Text variant="bodyStrong" color="secondary">
            {countryCode}
          </Text>
        </View>
        <View style={[styles.input, { borderStartWidth: 1, borderStartColor: theme.colors.border.subtle }]}>
          <TextInput
            ref={ref}
            {...rest}
            label={undefined}
            required={false}
            helpText={undefined}
            errorText={undefined}
            value={cleanValue}
            onChangeText={(t) => onChangeText(t.replace(/\D/g, '').slice(0, 9))}
            keyboardType="phone-pad"
            inputMode="tel"
            maxLength={9}
            placeholder={rest.placeholder ?? '7XXXXXXXX'}
            fullWidth={false}
            containerStyle={{ borderWidth: 0, backgroundColor: 'transparent', paddingStart: 8 }}
            inputStyle={{
              textAlign: isRTL ? 'right' : 'left',
              writingDirection: 'ltr',
            }}
            testID={rest.testID}
          />
        </View>
      </View>
    </Field>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 48,
    overflow: 'hidden',
  },
  prefix: {
    paddingHorizontal: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
});
