import { Pressable, StyleSheet, View } from 'react-native';

import { useDirection, useHaptics } from '@/hooks';
import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface TabItem<V extends string> {
  readonly key: V;
  readonly label: string;
  readonly icon?: IconName;
  readonly disabled?: boolean;
  /** Optional badge count. Renders a small pill after the label. */
  readonly badge?: number;
}

export interface TabsProps<V extends string> {
  readonly tabs: readonly TabItem<V>[];
  readonly value: V;
  readonly onChange: (key: V) => void;
  /** Default 'default'. Pills = rounded background when active. */
  readonly variant?: 'default' | 'pills';
  readonly testID?: string;
}

/**
 * Tab header only. Content rendering is the caller's responsibility
 * (typically `<Tabs value={tab} onChange={setTab} ... />` + conditional render).
 * Uses flex:1 per tab — all tabs equal width. Scrollable tabs are planned for P07+.
 */
export function Tabs<V extends string>({
  tabs,
  value,
  onChange,
  variant = 'default',
  testID,
}: TabsProps<V>) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const haptics = useHaptics();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.row,
        {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          borderBottomWidth: variant === 'default' ? 1 : 0,
          borderBottomColor: theme.colors.border.subtle,
          gap: variant === 'pills' ? theme.spacing[2] : 0,
        },
      ]}
      testID={testID}
    >
      {tabs.map((tab) => {
        const selected = tab.key === value;
        const isDisabled = !!tab.disabled;
        const bg =
          variant === 'pills'
            ? selected
              ? theme.colors.accent.fill
              : theme.colors.bg.surface
            : 'transparent';
        const color = selected
          ? variant === 'pills'
            ? 'primary'
            : 'accent'
          : isDisabled
            ? 'tertiary'
            : 'secondary';
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled: isDisabled }}
            accessibilityLabel={tab.label}
            disabled={isDisabled}
            onPress={() => {
              if (isDisabled) return;
              haptics.light();
              onChange(tab.key);
            }}
            style={({ pressed }) => [
              styles.tab,
              {
                backgroundColor: bg,
                borderRadius: variant === 'pills' ? theme.radius.full : 0,
                paddingHorizontal: theme.spacing[3],
                paddingVertical: theme.spacing[3],
                borderBottomWidth:
                  variant === 'default' && selected ? 2 : 0,
                borderBottomColor:
                  variant === 'default' ? theme.colors.accent.fill : 'transparent',
                opacity: isDisabled ? 0.4 : pressed ? 0.75 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.tabContent,
                { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 6 },
              ]}
            >
              {tab.icon ? <Icon name={tab.icon} size={16} color={theme.colors.text[color]} /> : null}
              <Text variant="bodyStrong" color={color} numberOfLines={1}>
                {tab.label}
              </Text>
              {tab.badge !== undefined ? (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: theme.colors.accent.fill, borderRadius: theme.radius.full },
                  ]}
                >
                  <Text variant="caption" color="primary">
                    {String(tab.badge)}
                  </Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  tabContent: { alignItems: 'center' },
  badge: { minWidth: 18, paddingHorizontal: 5, alignItems: 'center' },
});
