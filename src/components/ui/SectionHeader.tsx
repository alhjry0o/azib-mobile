import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useDirection, useHaptics } from '@/hooks';
import { useTheme } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';

export interface SectionHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
  testID,
}: SectionHeaderProps) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const haptics = useHaptics();
  const showAction = !!actionLabel && !!onAction;

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          gap: theme.spacing[3],
          marginBottom: theme.spacing[3],
        },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.titleBlock}>
        <Text variant="h3" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="secondary" numberOfLines={2} style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {showAction ? (
        <Pressable
          onPress={() => {
            haptics.light();
            onAction();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={[
            styles.action,
            { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 2 },
          ]}
          testID={testID ? `${testID}-action` : undefined}
        >
          <Text variant="bodyStrong" color="accent">
            {actionLabel}
          </Text>
          <Icon
            name={isRTL ? 'chevronLeft' : 'chevronRight'}
            size={16}
            color={theme.colors.text.accent}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  titleBlock: { flex: 1 },
  action: { alignItems: 'center' },
});
