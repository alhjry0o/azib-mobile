// StateView — internal base for EmptyState / ErrorState / NotConnectedState.
// Not exported from the barrel. Composes an icon, title, description, and actions.
// Consumed via the three public wrappers below.

import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Button, type ButtonVariant } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type StateViewTone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent';

export interface StateViewAction {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: ButtonVariant;
  readonly loading?: boolean;
}

export interface StateViewProps {
  readonly icon?: IconName;
  readonly tone?: StateViewTone;
  readonly illustration?: ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly action?: StateViewAction;
  readonly secondaryAction?: StateViewAction;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function StateView({
  icon = 'info',
  tone = 'neutral',
  illustration,
  title,
  description,
  action,
  secondaryAction,
  style,
  testID,
}: StateViewProps) {
  const theme = useTheme();

  const tint =
    tone === 'success'
      ? theme.colors.state.success
      : tone === 'warning'
        ? theme.colors.gold.fill
        : tone === 'danger'
          ? theme.colors.state.danger
          : tone === 'accent'
            ? theme.colors.accent.fill
            : theme.colors.text.secondary;

  const tintBg =
    tone === 'success'
      ? 'rgba(63,207,142,0.14)'
      : tone === 'warning'
        ? 'rgba(217,169,40,0.16)'
        : tone === 'danger'
          ? 'rgba(255,92,122,0.16)'
          : tone === 'accent'
            ? 'rgba(155,92,255,0.16)'
            : 'rgba(167,162,179,0.12)';

  return (
    <View style={[styles.container, style]} testID={testID}>
      {illustration ? (
        <View style={styles.illustration}>{illustration}</View>
      ) : (
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: tintBg, borderColor: tint, borderRadius: 9999 },
          ]}
        >
          <Icon name={icon} size={28} color={tint} />
        </View>
      )}

      <Text variant="h3" align="center" style={{ marginTop: theme.spacing[4] }}>
        {title}
      </Text>
      {description ? (
        <Text
          variant="body"
          color="secondary"
          align="center"
          style={{ marginTop: theme.spacing[2] }}
        >
          {description}
        </Text>
      ) : null}

      {(action || secondaryAction) && (
        <View style={[styles.actions, { marginTop: theme.spacing[5] }]}>
          {action ? (
            <Button
              variant={action.variant ?? 'primary'}
              size="md"
              label={action.label}
              loading={action.loading}
              onPress={action.onPress}
            />
          ) : null}
          {secondaryAction ? (
            <Button
              variant={secondaryAction.variant ?? 'ghost'}
              size="md"
              label={secondaryAction.label}
              loading={secondaryAction.loading}
              onPress={secondaryAction.onPress}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  illustration: {
    marginBottom: 8,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    alignItems: 'stretch',
    gap: 8,
    width: '100%',
    maxWidth: 280,
  },
});
