// Account tab hub. Profile and settings are real screens from P06.2.
// Finance entry points added in P09.2–P09.3. Developer links stay non-production.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card, Icon, ListItem, Screen, Text } from '@/components/ui';
import { env } from '@/config';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import { useTheme } from '@/theme';
import { useSession } from './use-session';

export function AccountPlaceholder() {
  const container = useProviderContainer();
  const session = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const [busy, setBusy] = useState(false);

  const user = session.result?.ok ? (session.result.value?.user ?? null) : null;

  const signOut = async (): Promise<void> => {
    setBusy(true);
    const result = await container.auth.signOut();
    setBusy(false);
    if (result.ok) {
      session.setSession(null);
      router.replace(href(ROUTES.auth.welcome));
    }
  };

  return (
    <Screen
      scroll
      testID="account-screen"
      contentStyle={{ paddingBottom: theme.spacing[12], gap: theme.spacing[4] }}
    >
      <Text variant="h1" style={{ marginTop: theme.spacing[4] }}>
        {t('common:shell.account.title')}
      </Text>
      <Text variant="body" color="secondary">
        {t('common:shell.account.description')}
      </Text>
      {user ? (
        <Card testID="account-user-card">
          <Text variant="caption" color="secondary">
            {t('common:shell.account.signedInAs')}
          </Text>
          <Text variant="bodyStrong">{user.displayName}</Text>
          {user.dataOrigin === 'demo' ? (
            <Badge variant="demo" label={t('common:demo.badge')} testID="account-demo-badge" />
          ) : null}
        </Card>
      ) : null}
      <ListItem
        variant="card"
        title={t('profile:title')}
        leading={<Icon name="userCheck" size={20} />}
        onPress={() => router.push(href(ROUTES.profile.root))}
        testID="account-profile"
      />
      <ListItem
        variant="card"
        title={t('assistance:finance.catalog.title')}
        leading={<Icon name="wallet" size={20} />}
        onPress={() => router.push(href(ROUTES.programs.root))}
        testID="account-programs"
      />
      <ListItem
        variant="card"
        title={t('assistance:finance.donations.title')}
        leading={<Icon name="heart" size={20} />}
        onPress={() => router.push(href(ROUTES.programs.donations))}
        testID="account-donations"
      />
      <ListItem
        variant="card"
        title={t('assistance:finance.receipts.title')}
        leading={<Icon name="checkCircle" size={20} />}
        onPress={() => router.push(href(ROUTES.programs.receipts))}
        testID="account-receipts"
      />
      <ListItem
        variant="card"
        title={t('assistance:finance.disbursements.title')}
        leading={<Icon name="creditCard" size={20} />}
        onPress={() => router.push(href(ROUTES.programs.disbursements))}
        testID="account-disbursements"
      />
      <ListItem
        variant="card"
        title={t('profile:settings.title')}
        leading={<Icon name="settings" size={20} />}
        onPress={() => router.push(href(ROUTES.settings.root))}
        testID="account-settings"
      />
      <ListItem
        variant="card"
        title={t('common:shell.account.notifications')}
        leading={<Icon name="bell" size={20} />}
        onPress={() => router.push(href(ROUTES.features.notifications))}
        testID="account-notifications"
      />
      {env.APP_MODE !== 'production' ? (
        <ListItem
          variant="card"
          title={t('common:shell.dev.title')}
          leading={<Icon name="settings" size={20} />}
          onPress={() => router.push(href(ROUTES.dev))}
          testID="account-dev-settings"
        />
      ) : null}
      {env.APP_MODE !== 'production' ? (
        <ListItem
          variant="card"
          title={t('auth:devTools.title')}
          leading={<Icon name="shield" size={20} />}
          onPress={() => router.push(href(ROUTES.devAuth))}
          testID="account-dev-auth"
        />
      ) : null}
      <Button
        variant="secondary"
        fullWidth
        loading={busy}
        label={t('common:shell.account.signOut')}
        onPress={() => {
          void signOut();
        }}
        testID="sign-out"
      />
    </Screen>
  );
}
