import { useTranslation } from 'react-i18next';
import { Banner, Card, Switch } from '@/components/ui';
import { useSettingsStore, type NotificationCategory } from '@/stores';
import { useTheme } from '@/theme';
import { SettingsScaffold } from '../components/SettingsScaffold';

const CATEGORIES: readonly NotificationCategory[] = ['assistance', 'weddings', 'marketplace'];

export function NotificationsSettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const notifications = useSettingsStore((s) => s.notifications);
  const setEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
  const setCategory = useSettingsStore((s) => s.setNotificationCategory);

  return (
    <SettingsScaffold
      testID="settings-notifications-screen"
      title={t('profile:settings.rows.notifications')}
    >
      <Banner
        variant="info"
        message={t('profile:settings.notifications.noPushYet')}
        testID="notifications-no-push"
      />
      <Card style={{ gap: theme.spacing[3] }}>
        <Switch
          value={notifications.enabled}
          onValueChange={setEnabled}
          label={t('profile:settings.notifications.master')}
          labelFirst
          testID="notifications-master"
        />
        {CATEGORIES.map((category) => (
          <Switch
            key={category}
            value={notifications[category]}
            disabled={!notifications.enabled}
            onValueChange={(value) => setCategory(category, value)}
            label={t(`profile:settings.notifications.${category}`)}
            labelFirst
            testID={`notifications-${category}`}
          />
        ))}
      </Card>
    </SettingsScaffold>
  );
}
