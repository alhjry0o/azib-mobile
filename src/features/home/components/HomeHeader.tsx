import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useAuth } from '@/features/auth';
import { useNotificationsBadge } from '@/features/shell';
import { useDirection } from '@/hooks';
import { useProviderContainer } from '@/providers';
import { useTheme } from '@/theme';
import { useHomeGreeting } from '../hooks/use-home-greeting';

export interface HomeHeaderProps {
  readonly onCustomize: () => void;
}

export function HomeHeader({ onCustomize }: HomeHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const auth = useAuth();
  const container = useProviderContainer();
  const unread = useNotificationsBadge();
  const greetingKey = useHomeGreeting();

  const name = auth.user?.displayName ?? t('home:guest.name');
  const badgeText = unread > 9 ? '9+' : String(unread);

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: theme.spacing[4], gap: theme.spacing[3] },
      ]}
    >
      <View
        style={[
          styles.row,
          { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[3] },
        ]}
      >
        <View style={styles.identity}>
          <Text variant="caption" color="secondary" testID="home-greeting">
            {t(greetingKey)}
          </Text>
          <Text variant="h2" numberOfLines={1} testID="home-display-name">
            {name}
          </Text>
        </View>
        <View
          style={[
            styles.actions,
            { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
          ]}
        >
          <Button
            variant="icon"
            size="sm"
            leftIcon="search"
            accessibilityLabel={t('home:header.search')}
            onPress={() => router.push(href(ROUTES.features.search))}
            testID="home-search"
          />
          <View>
            <Button
              variant="icon"
              size="sm"
              leftIcon="bell"
              accessibilityLabel={t('home:header.notifications')}
              onPress={() => router.push(href(ROUTES.features.notifications))}
              testID="home-notifications"
            />
            {unread > 0 ? (
              <View
                testID="home-notifications-badge"
                style={[styles.badge, { backgroundColor: theme.colors.state.danger }]}
              >
                <Text variant="captionStrong" color="primary" style={styles.badgeText}>
                  {badgeText}
                </Text>
              </View>
            ) : null}
          </View>
          <Button
            variant="icon"
            size="sm"
            leftIcon="settings"
            accessibilityLabel={t('home:header.customize')}
            onPress={onCustomize}
            testID="home-customize"
          />
        </View>
      </View>
      {container.mode === 'demo' ? (
        <Badge variant="demo" label={t('common:demo.badge')} testID="home-demo-badge" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 12 },
  row: { alignItems: 'center' },
  identity: { flex: 1, gap: 2 },
  actions: { alignItems: 'center' },
  badge: {
    position: 'absolute',
    top: -4,
    end: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, lineHeight: 12 },
});
