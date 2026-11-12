import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { formatDate } from '@/i18n';
import { useHaptics } from '@/hooks';
import { useTheme } from '@/theme';

import { Icon } from '../Icon';
import { Text } from '../Text';
import { CalendarModal } from './CalendarModal';
import { Field } from './Field';

export interface DatePickerProps {
  readonly value: Date | null;
  readonly onChange: (date: Date | null) => void;
  readonly minDate?: Date;
  readonly maxDate?: Date;
  readonly placeholder?: string;
  readonly label?: string;
  readonly required?: boolean;
  readonly helpText?: string;
  readonly errorText?: string;
  readonly error?: boolean;
  readonly disabled?: boolean;
  readonly testID?: string;
}

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder,
  label,
  required = false,
  helpText,
  errorText,
  error = false,
  disabled = false,
  testID,
}: DatePickerProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const haptics = useHaptics();
  const [open, setOpen] = useState(false);
  const hasError = error || !!errorText;

  const language = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const display = value ? formatDate(value, 'medium', { language }) : '';

  const triggerBorder = hasError
    ? theme.colors.state.danger
    : open
      ? theme.colors.accent.fill
      : theme.colors.border.subtle;

  return (
    <Field
      label={label}
      required={required}
      helpText={helpText}
      errorText={errorText}
      disabled={disabled}
      testID={testID ? `${testID}-field` : undefined}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        accessibilityLabel={display || placeholder}
        disabled={disabled}
        onPress={() => {
          if (disabled) return;
          haptics.light();
          setOpen(true);
        }}
        testID={testID}
        style={[
          styles.trigger,
          {
            backgroundColor: theme.colors.bg.surface,
            borderColor: triggerBorder,
            borderWidth: open || hasError ? 2 : 1,
            borderRadius: theme.radius.md,
            paddingStart: theme.spacing[3],
            paddingEnd: theme.spacing[3],
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text variant="body" color={display ? 'primary' : 'tertiary'}>
          {display || placeholder || ''}
        </Text>
        <Icon name="calendar" size={18} color={theme.colors.text.secondary} />
      </Pressable>

      <CalendarModal
        visible={open}
        value={value}
        minDate={minDate}
        maxDate={maxDate}
        onClose={() => setOpen(false)}
        onSelect={(date) => {
          onChange(date);
          setOpen(false);
        }}
      />
    </Field>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
});
