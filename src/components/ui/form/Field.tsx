import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from '../Text';

export interface FieldProps {
  readonly label?: string;
  readonly required?: boolean;
  readonly helpText?: string;
  readonly errorText?: string;
  readonly disabled?: boolean;
  readonly children: ReactNode;
  readonly testID?: string;
}

/**
 * Field wraps an input with label / help / error.
 * Renders in logical order (label above input, help/error below) for RTL/LTR.
 * Never renders Arabic hardcoded: caller passes already-translated strings.
 */
export function Field({
  label,
  required = false,
  helpText,
  errorText,
  disabled = false,
  children,
  testID,
}: FieldProps) {
  const theme = useTheme();
  const hasError = !!errorText;

  return (
    <View style={styles.container} testID={testID}>
      {label ? (
        <View style={styles.labelRow}>
          <Text variant="captionStrong" color={disabled ? 'tertiary' : 'secondary'}>
            {label}
          </Text>
          {required ? (
            <Text variant="captionStrong" color="accent" style={styles.required}>
              *
            </Text>
          ) : null}
        </View>
      ) : null}
      <View style={{ marginTop: label ? theme.spacing[2] : 0 }}>{children}</View>
      {hasError ? (
        <Text variant="caption" color="accent" style={styles.helper}>
          {errorText}
        </Text>
      ) : helpText ? (
        <Text variant="caption" color="secondary" style={styles.helper}>
          {helpText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  required: { fontSize: 13 },
  helper: { marginTop: 6 },
});
