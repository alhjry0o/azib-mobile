// Floating Dock: 5 tabs, emphasized center (weddings), selection motion,
// notifications badge, hides while keyboard is open, safe-area aware, RTL order
// (home first = rightmost in RTL). Glass is allowed here (Dock, per AGENT_RULES).
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassView } from '@/components/brand';
import { Icon, Text } from '@/components/ui';
import { TABS, href, type TabConfig } from '@/constants/routes';
import { useDirection, useHaptics } from '@/hooks';
import { isTabActive } from '@/features/shell/routing';
import { useKeyboardVisible } from '@/features/shell/use-keyboard-visibility';
import { useNotificationsBadge } from '@/features/shell/use-notifications-badge';
import { useTheme, type Theme } from '@/theme';

export function FloatingDock() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isRTL } = useDirection();
  const router = useRouter();
  const pathname = usePathname();
  const keyboardVisible = useKeyboardVisible();
  const unread = useNotificationsBadge();
  const haptics = useHaptics();
  const { t } = useTranslation();

  if (keyboardVisible) return null;

  return (
    <View
      pointerEvents="box-none"
      testID="floating-dock"
      style={[
        styles.wrap,
        {
          bottom: insets.bottom + theme.spacing[2],
          start: theme.spacing[4],
          end: theme.spacing[4],
        },
      ]}
    >
      <GlassView
        intensity={70}
        style={[styles.bar, { borderRadius: theme.radius.full }, theme.shadows.lg]}
      >
        <View
          accessibilityRole="tablist"
          testID="dock-items"
          style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
        >
          {TABS.map((tab) => (
            <DockItem
              key={tab.key}
              tab={tab}
              theme={theme}
              label={t(tab.labelKey)}
              active={isTabActive(pathname, tab.path)}
              badge={tab.key === 'account' ? unread : 0}
              onPress={() => {
                haptics.light();
                router.navigate(href(tab.route));
              }}
            />
          ))}
        </View>
      </GlassView>
    </View>
  );
}

interface DockItemProps {
  readonly tab: TabConfig;
  readonly theme: Theme;
  readonly label: string;
  readonly active: boolean;
  readonly badge: number;
  readonly onPress: () => void;
}

function DockItem({ tab, theme, label, active, badge, onPress }: DockItemProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(active ? 1.1 : 1, theme.springs.gentle);
  }, [active, scale, theme.springs.gentle]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const accessibilityLabel = badge > 0 ? `${label} (${badge})` : label;

  if (tab.center) {
    return (
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        testID={`dock-item-${tab.key}`}
        style={styles.slot}
      >
        <Animated.View
          style={[
            styles.centerCircle,
            {
              backgroundColor: active ? theme.colors.gold.fillHover : theme.colors.gold.fill,
            },
            theme.shadows.sm,
            animatedStyle,
          ]}
        >
          <Icon name={tab.icon} size={24} color={theme.colors.text.inverse} />
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      testID={`dock-item-${tab.key}`}
      style={styles.slot}
    >
      <Animated.View style={[styles.itemInner, animatedStyle]}>
        <View style={styles.iconWrap}>
          <Icon
            name={tab.icon}
            size={22}
            color={active ? theme.colors.text.accentOnRaised : theme.colors.text.secondary}
          />
          {badge > 0 ? (
            <View
              testID="dock-badge"
              style={[styles.badge, { backgroundColor: theme.colors.state.danger }]}
            >
              <Text variant="captionStrong" color="primary" style={styles.badgeText}>
                {badge > 9 ? '9+' : String(badge)}
              </Text>
            </View>
          ) : null}
        </View>
        <Text
          variant="caption"
          color={active ? 'accentOnRaised' : 'secondary'}
          align="center"
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  bar: { overflow: 'hidden' },
  row: { height: 64, alignItems: 'center' },
  slot: {
    flex: 1,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInner: { alignItems: 'center', gap: 2 },
  iconWrap: { position: 'relative' },
  centerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    end: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, lineHeight: 12 },
});
