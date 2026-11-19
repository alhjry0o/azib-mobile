import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Icon, Text, type IconName } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useDirection, useHaptics } from '@/hooks';
import { useTheme } from '@/theme';
import type { HomeQuickActionId } from '../config/home-config.types';
import { useHomeConfig } from '../hooks/use-home-config';
import { Stagger } from './Stagger';

interface QuickAction {
  readonly id: HomeQuickActionId;
  readonly icon: IconName;
  readonly route: string;
}

const ACTIONS: readonly QuickAction[] = [
  { id: 'assistance', icon: 'wallet', route: ROUTES.features.assistance },
  { id: 'weddings', icon: 'heart', route: ROUTES.tabs.weddings },
  { id: 'offers', icon: 'gift', route: ROUTES.tabs.partners },
  { id: 'souk', icon: 'shoppingBag', route: ROUTES.features.souk },
  { id: 'jobs', icon: 'users', route: ROUTES.features.jobs },
  { id: 'calculator', icon: 'creditCard', route: ROUTES.features.calculator },
  { id: 'guide', icon: 'sparkles', route: ROUTES.features.guide },
];

const COLUMNS = 4;

export function QuickActions() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const haptics = useHaptics();
  const { width } = useWindowDimensions();
  const config = useHomeConfig();

  const gap = theme.spacing[2];
  const tileSize = Math.floor((width - theme.spacing[4] * 2 - gap * (COLUMNS - 1)) / COLUMNS);
  const visible = ACTIONS.filter((action) => config.quickActions.includes(action.id));

  if (visible.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: theme.spacing[4], gap: theme.spacing[3] },
      ]}
      testID="home-quick-actions"
    >
      <Text variant="h3">{t('home:quickActions.title')}</Text>
      <View
        style={[
          styles.grid,
          { flexDirection: isRTL ? 'row-reverse' : 'row', gap },
        ]}
      >
        {visible.map((action, index) => (
          <Stagger key={action.id} index={index}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(`home:quickActions.${action.id}`)}
              onPress={() => {
                haptics.light();
                router.navigate(href(action.route));
              }}
              testID={`quick-action-${action.id}`}
              style={({ pressed }) => [
                styles.tile,
                {
                  width: tileSize,
                  backgroundColor: theme.colors.bg.surface,
                  borderColor: theme.colors.border.subtle,
                  borderRadius: theme.radius.lg,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: theme.colors.bg.raised,
                    borderColor: theme.colors.gold.fill,
                  },
                ]}
              >
                <Icon name={action.icon} size={20} color={theme.colors.text.gold} />
              </View>
              <Text variant="caption" color="secondary" align="center" numberOfLines={2}>
                {t(`home:quickActions.${action.id}`)}
              </Text>
            </Pressable>
          </Stagger>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 16 },
  grid: { flexWrap: 'wrap' },
  tile: {
    minHeight: 88,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 6,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
