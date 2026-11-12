import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ElementRef,
} from 'react';
import {
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native';

import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';

import { Text } from '../Text';
import { Field } from './Field';

type RNTextInputRef = ElementRef<typeof RNTextInput>;

export interface OTPInputRef {
  focus(): void;
  clear(): void;
}

export interface OTPInputProps {
  /** Number of digits. Default 6. */
  readonly length?: number;
  /** Current digits (no separators). */
  readonly value: string;
  readonly onChangeText: (digitsOnly: string) => void;
  /** Called once when value.length === length. */
  readonly onComplete?: (code: string) => void;
  readonly label?: string;
  readonly required?: boolean;
  readonly helpText?: string;
  readonly errorText?: string;
  readonly error?: boolean;
  readonly disabled?: boolean;
  readonly autoFocus?: boolean;
  readonly testID?: string;
}

/**
 * OTP code input.
 *
 * Uses a single hidden TextInput overlaying N visual cells.
 * Benefits:
 *  - Paste works (multi-digit paste fills all cells).
 *  - iOS textContentType="oneTimeCode" auto-fill works.
 *  - Android autoComplete="sms-otp" works.
 *  - Backspace and cursor behave naturally.
 *  - One accessibility target — screen readers announce "verification code, N digits".
 */
export const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(function OTPInput(
  {
    length = 6,
    value,
    onChangeText,
    onComplete,
    label,
    required = false,
    helpText,
    errorText,
    error = false,
    disabled = false,
    autoFocus = false,
    testID,
  },
  ref,
) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<RNTextInputRef>(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => onChangeText(''),
    }),
    [onChangeText],
  );

  const hasError = error || !!errorText;
  const cells = Array.from({ length }, (_, i) => value[i] ?? '');
  const cursorIndex = Math.min(value.length, length - 1);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, length);
    if (digits === value) return;
    onChangeText(digits);
    if (digits.length === length) {
      onComplete?.(digits);
    }
  };

  return (
    <Field
      label={label}
      required={required}
      helpText={helpText}
      errorText={errorText}
      disabled={disabled}
      testID={testID ? `${testID}-field` : undefined}
    >
      <View
        style={[
          styles.container,
          {
            gap: theme.spacing[2],
            flexDirection: isRTL ? 'row-reverse' : 'row',
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {cells.map((char, i) => {
          const isCursor = focused && i === cursorIndex && value.length < length;
          const isFilled = char !== '';
          const borderColor = hasError
            ? theme.colors.state.danger
            : isCursor
              ? theme.colors.accent.fill
              : isFilled
                ? theme.colors.accent.fill
                : theme.colors.border.subtle;
          return (
            <View
              key={i}
              pointerEvents="none"
              style={[
                styles.cell,
                {
                  backgroundColor: theme.colors.bg.surface,
                  borderColor,
                  borderWidth: isCursor || hasError ? 2 : 1,
                  borderRadius: theme.radius.md,
                },
              ]}
            >
              {isCursor ? (
                <View style={[styles.cursor, { backgroundColor: theme.colors.accent.fill }]} />
              ) : (
                <Text variant="h2" color={isFilled ? 'primary' : 'tertiary'}>
                  {char || ''}
                </Text>
              )}
            </View>
          );
        })}

        <RNTextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={!disabled}
          autoFocus={autoFocus}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={length}
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          caretHidden
          accessibilityLabel={label}
          accessibilityHint={`${length} ${length === 1 ? 'digit' : 'digits'}`}
          accessibilityState={{ disabled }}
          style={styles.hiddenInput}
          testID={testID}
        />
      </View>
    </Field>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 56,
    maxHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cursor: {
    width: 2,
    height: 24,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.01,
    color: 'transparent',
  },
});
