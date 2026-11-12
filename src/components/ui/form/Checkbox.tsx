import { Pressable, StyleSheet, View } from 'react-native';

import { useHaptics, useMotion } from '@/hooks';
import { useTheme } from '@/theme';

import { Icon } from '../Icon';
import { Text } from '../Text';

export interface CheckboxProps {
  readonly checked: boolean;
  readonly onCheckedChange: (checked: boolean) => void;
  readonly indeterminate?: boolean;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly error?: boolean;
  readonly testID?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  indeterminate = false,
  disabled = false,
  label,
  error = false,
  testID,
}: CheckboxProps) {
  const theme = useTheme();
  const motion = useMotion();
  const haptics = useHaptics();
  // motion unused here; kept for future size transitions.

  const active = checked || indeterminate;
  const bg = active ? theme.colors.accent.fill : theme.colors.bg.surface;
  const borderColor = error
    ? theme.colors.state.danger
    : active
      ? theme.colors.accent.fill
      : theme.colors.border.strong;

  const onPress = () => {
    if (disabled) return;
    haptics.light();
    onCheckedChange(!checked);
  };

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      testID={testID}
      style={[styles.row, { opacity: disabled ? 0.5 : 1 }]}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: bg,
            borderColor,
            borderRadius: theme.radius.xs,
          },
        ]}
      >
        {indeterminate ? (
          <View style={[styles.dash, { backgroundColor: theme.colors.text.primary }]} />
        ) : checked ? (
          <Icon name="check" size={14} color={theme.colors.text.primary} strokeWidth={3} />
        ) : null}
      </View>
      {label ? (
        <Text variant="body" color={disabled ? 'tertiary' : 'primary'} style={styles.label}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  box: { width: 22, height: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dash: { width: 10, height: 2, borderRadius: 1 },
  label: { flexShrink: 1 },
});
