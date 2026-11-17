import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Card, Icon, ListItem, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/theme';
import { SettingsScaffold } from '../components/SettingsScaffold';
import { SignOutButton } from '../components/SignOutButton';

export function AccountSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const auth = useAuth();
  const user = auth.user;
  const verified = auth.phase === 'authenticated';

  return (
    <SettingsScaffold
      testID="settings-account-screen"
      title={t('profile:settings.rows.account')}
      guardBackend
    >
      <Card testID="account-identity">
        <Text variant="caption" color="secondary">
          {t('profile:fields.displayName')}
        </Text>
        <Text variant="bodyStrong">{user?.displayName ?? t('profile:view.none')}</Text>
        <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing[2] }}>
          {t('auth:fields.email')}
        </Text>
        <Text variant="body" testID="account-email">
          {user?.email ?? t('profile:view.none')}
        </Text>
        <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing[2] }}>
          {t('profile:view.accountType')}
        </Text>
        <Text variant="body">{t(`auth:roles.${user?.roles?.[0] ?? 'member'}`)}</Text>
      </Card>
      <Badge
        variant={verified ? 'verified' : 'pending'}
        label={verified ? t('profile:verification.verified') : t('profile:verification.pending')}
        testID="account-verification"
      />
      {user?.dataOrigin === 'demo' ? (
        <Badge variant="demo" label={t('common:demo.badge')} testID="account-demo" />
      ) : null}
      <ListItem
        variant="card"
        title={t('profile:settings.rows.profile')}
        leading={<Icon name="userCheck" size={20} />}
        onPress={() => router.push(href(ROUTES.profile.root))}
        testID="account-open-profile"
      />
      <SignOutButton testID="account-sign-out" />
    </SettingsScaffold>
  );
}
