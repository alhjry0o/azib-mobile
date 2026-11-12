import { forwardRef, useState, type ElementRef } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput as RNTextInput,
  View,
  type StyleProp,
  type TextInputProps as RNTextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';

import { Icon, type IconName } from '../Icon';
import { Field } from './Field';

export type TextInputSize = 'sm' | 'md' | 'lg';

const SIZES: Record<TextInputSize, { height: number; font: number; paddingX: number; iconSize: number }> = {
  sm: { height: 40, font: 14, paddingX: 12, iconSize: 16 },
  md: { height: 48, font: 16, paddingX: 14, iconSize: 18 },
  lg: { height: 56, font: 16, paddingX: 16, iconSize: 20 },
};

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  readonly size?: TextInputSize;
  readonly error?: boolean;
  readonly leftIcon?: IconName;
  readonly rightIcon?: IconName;
  readonly onRightIconPress?: () => void;
  readonly label?: string;
  readonly required?: boolean;
  readonly helpText?: string;
  readonly errorText?: string;
  readonly disabled?: boolean;
  readonly fullWidth?: boolean;
  readonly containerStyle?: StyleProp<ViewStyle>;
  readonly inputStyle?: StyleProp<TextStyle>;
  readonly testID?: string;
}

export const TextInput = forwardRef<ElementRef<typeof RNTextInput>, TextInputProps>(function TextInput(
  {
    size = 'md',
    error = false,
    leftIcon,
    rightIcon,
    onRightIconPress,
    label,
    required = false,
    helpText,
    errorText,
    disabled = false,
    fullWidth = true,
    containerStyle,
    testID,
    editable,
    keyboardType,
    ...rest
  },
  ref,
) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const [focused, setFocused] = useState(false);
  const spec = SIZES[size];
  const isDisabled = disabled || editable === false;
  const hasError = error || !!errorText;

  // Numeric/phone/email inputs stay LTR even in Arabic UI.
  const isLTRInput =
    keyboardType === 'numeric' ||
    keyboardType === 'phone-pad' ||
    keyboardType === 'email-address' ||
    keyboardType === 'number-pad' ||
    keyboardType === 'decimal-pad';

  const borderColor = hasError
    ? theme.colors.state.danger
    : focused
      ? theme.colors.accent.fill
      : theme.colors.border.subtle;

  return (
    <Field
      label={label}
      required={required}
      helpText={helpText}
      errorText={errorText}
      disabled={isDisabled}
      testID={testID ? `${testID}-field` : undefined}
    >
      <View
        style={[
          styles.container,
          {
            height: spec.height,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.bg.surface,
            borderColor,
            borderWidth: focused || hasError ? 2 : 1,
            paddingStart: leftIcon ? theme.spacing[2] : spec.paddingX,
            paddingEnd: rightIcon ? theme.spacing[2] : spec.paddingX,
            opacity: isDisabled ? 0.5 : 1,
          },
          fullWidth && styles.fullWidth,
          containerStyle,
        ]}
      >
        {leftIcon ? (
          <Icon name={leftIcon} size={spec.iconSize} color={theme.colors.text.secondary} />
        ) : null}
        <RNTextInput
          ref={ref}
          {...rest}
          keyboardType={keyboardType}
          editable={!isDisabled}
          placeholderTextColor={theme.colors.text.tertiary}
          selectionColor={theme.colors.accent.fill}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          accessibilityState={{ disabled: isDisabled }}
          style={[
            styles.input,
            {
              fontSize: spec.font,
              color: theme.colors.text.primary,
              textAlign: isLTRInput ? 'left' : isRTL ? 'right' : 'left',
              writingDirection: isLTRInput ? 'ltr' : isRTL ? 'rtl' : 'ltr',
              paddingStart: theme.spacing[1],
              paddingEnd: theme.spacing[1],
            },
          ]}
          testID={testID}
        />
        {rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            accessibilityRole={onRightIconPress ? 'button' : undefined}
            hitSlop={8}
            style={{ paddingHorizontal: 4 }}
          >
            <Icon name={rightIcon} size={spec.iconSize} color={theme.colors.text.secondary} />
          </Pressable>
        ) : null}
      </View>
    </Field>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fullWidth: { width: '100%' },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
});
