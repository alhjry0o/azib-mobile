import { Pressable, StyleSheet, View } from 'react-native';

import { useHaptics } from '@/hooks';
import { useTheme } from '@/theme';

import { Text } from '../Text';

export interface RadioOption<V extends string> {
  readonly value: V;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface RadioGroupProps<V extends string> {
  readonly options: readonly RadioOption<V>[];
  readonly value: V | null;
  readonly onValueChange: (value: V) => void;
  readonly disabled?: boolean;
  readonly direction?: 'row' | 'column';
  readonly error?: boolean;
  readonly testID?: string;
}

export function RadioGroup<V extends string>({
  options,
  value,
  onValueChange,
  disabled = false,
  direction = 'column',
  error = false,
  testID,
}: RadioGroupProps<V>) {
  const theme = useTheme();
  const haptics = useHaptics();

  return (
    <View
      accessibilityRole="radiogroup"
      style={[direction === 'row' ? styles.row : styles.column, { gap: theme.spacing[3] }]}
      testID={testID}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        const isDisabled = disabled || !!opt.disabled;
        const borderColor = error
          ? theme.colors.state.danger
          : selected
            ? theme.colors.accent.fill
            : theme.colors.border.strong;

        return (
          <Pressable
            key={opt.value}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: isDisabled }}
            accessibilityLabel={opt.label}
            onPress={() => {
              if (isDisabled) return;
              haptics.light();
              onValueChange(opt.value);
            }}
            disabled={isDisabled}
            hitSlop={8}
            style={[styles.option, { opacity: isDisabled ? 0.5 : 1 }]}
          >
            <View style={[styles.outer, { borderColor }]}>
              {selected ? (
                <View style={[styles.inner, { backgroundColor: theme.colors.accent.fill }]} />
              ) : null}
            </View>
            <Text variant="body" color={isDisabled ? 'tertiary' : 'primary'}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flexDirection: 'column' },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  outer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: { width: 10, height: 10, borderRadius: 5 },
});
