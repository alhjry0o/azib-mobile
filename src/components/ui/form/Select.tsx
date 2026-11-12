import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useDirection, useHaptics } from '@/hooks';
import { useTheme } from '@/theme';

import { Icon } from '../Icon';
import { Text } from '../Text';
import { Field } from './Field';

export interface SelectOption<V extends string> {
  readonly value: V;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface SelectProps<V extends string> {
  readonly value: V | null;
  readonly onChange: (value: V) => void;
  readonly options: readonly SelectOption<V>[];
  readonly placeholder?: string;
  readonly label?: string;
  readonly required?: boolean;
  readonly helpText?: string;
  readonly errorText?: string;
  readonly error?: boolean;
  readonly disabled?: boolean;
  readonly testID?: string;
}

export function Select<V extends string>({
  value,
  onChange,
  options,
  placeholder,
  label,
  required = false,
  helpText,
  errorText,
  error = false,
  disabled = false,
  testID,
}: SelectProps<V>) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const haptics = useHaptics();
  const [open, setOpen] = useState(false);

  const selected = value != null ? options.find((o) => o.value === value) ?? null : null;
  const hasError = error || !!errorText;
  const isDisabled = disabled || options.length === 0;

  const triggerBorder = hasError
    ? theme.colors.state.danger
    : open
      ? theme.colors.accent.fill
      : theme.colors.border.subtle;

  const openModal = () => {
    if (isDisabled) return;
    haptics.light();
    setOpen(true);
  };

  const close = () => setOpen(false);

  return (
    <Field
      label={label}
      required={required}
      helpText={helpText}
      errorText={errorText}
      disabled={isDisabled}
      testID={testID ? `${testID}-field` : undefined}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, expanded: open }}
        accessibilityLabel={selected?.label ?? placeholder}
        onPress={openModal}
        disabled={isDisabled}
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
            opacity: isDisabled ? 0.5 : 1,
          },
        ]}
      >
        <Text variant="body" color={selected ? 'primary' : 'tertiary'} numberOfLines={1}>
          {selected?.label ?? placeholder ?? ''}
        </Text>
        <Icon name={open ? 'chevronUp' : 'chevronDown'} size={18} color={theme.colors.text.secondary} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
        statusBarTranslucent
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: theme.colors.bg.overlay }]}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="close"
        >
          <View
            onStartShouldSetResponder={() => true}
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.bg.raised,
                borderRadius: theme.radius.xl,
                paddingVertical: theme.spacing[2],
                maxHeight: '70%',
                marginHorizontal: theme.spacing[4],
              },
            ]}
          >
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((option) => {
                const isSelected = option.value === value;
                const isOptionDisabled = !!option.disabled;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: isSelected, disabled: isOptionDisabled }}
                    accessibilityLabel={option.label}
                    disabled={isOptionDisabled}
                    onPress={() => {
                      if (isOptionDisabled) return;
                      haptics.light();
                      onChange(option.value);
                      close();
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      {
                        paddingVertical: theme.spacing[3],
                        paddingStart: theme.spacing[4],
                        paddingEnd: theme.spacing[4],
                        backgroundColor: pressed
                          ? theme.colors.bg.surface
                          : isSelected
                            ? theme.colors.bg.surface
                            : 'transparent',
                        opacity: isOptionDisabled ? 0.4 : 1,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        justifyContent: 'space-between',
                      },
                    ]}
                  >
                    <Text
                      variant={isSelected ? 'bodyStrong' : 'body'}
                      color={isSelected ? 'accent' : 'primary'}
                    >
                      {option.label}
                    </Text>
                    {isSelected ? <Icon name="check" size={18} color={theme.colors.text.accent} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </Field>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 8,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
  },
  sheet: {
    overflow: 'hidden',
  },
  option: {
    alignItems: 'center',
    minHeight: 48,
  },
});
