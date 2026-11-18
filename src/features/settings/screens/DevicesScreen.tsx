import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  Screen,
  Skeleton,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { authErrorKey } from '@/features/auth/errors';
import { useSession } from '@/features/shell/use-session';
import { useTheme } from '@/theme';
import { SettingsScaffold } from '../components/SettingsScaffold';
import { useSecurity } from '../use-security';

export function DevicesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const security = useSecurity();
  const session = useSession();
  const signedIn = session.result?.ok === true && session.result.value !== null;

  const revoke = async (sessionId: string, current: boolean): Promise<void> => {
    const result = await security.revoke(sessionId);
    if (result.ok && current) router.replace(href(ROUTES.auth.welcome));
  };

  return (
    <SettingsScaffold
      testID="settings-devices-screen"
      title={t('profile:settings.rows.devices')}
      backTo={ROUTES.settings.security}
      guardBackend
    >
      <Banner variant="demo" message={t('auth:devices.demoNote')} testID="devices-demo-note" />
      <Button
        variant="secondary"
        fullWidth
        label={t('auth:devices.refresh')}
        onPress={security.refresh}
        testID="devices-refresh"
      />
      {security.error ? (
        <Banner
          variant="error"
          message={t(authErrorKey(security.error))}
          testID="devices-error"
        />
      ) : null}
      {security.loading ? (
        <Screen testID="devices-loading" safeTop={false} safeBottom={false}>
          <Skeleton variant="rect" height={72} />
          <Skeleton variant="rect" height={72} />
        </Screen>
      ) : null}
      {!security.loading && !signedIn ? (
        <EmptyState
          testID="devices-empty"
          icon="phone"
          title={t('auth:devices.emptyTitle')}
          description={t('auth:devices.emptyDescription')}
        />
      ) : null}
      {!security.loading &&
        security.sessions.map((info) => (
          <Card key={info.id} style={{ gap: theme.spacing[2] }} testID={`device-${info.id}`}>
            <Text variant="bodyStrong">{info.deviceLabel}</Text>
            <Text variant="caption" color="secondary">
              {t('auth:devices.createdAt', { value: info.createdAt })}
            </Text>
            <Text variant="caption" color="secondary">
              {t('auth:devices.lastSeenAt', { value: info.lastSeenAt })}
            </Text>
            {info.current ? (
              <Badge
                variant="success"
                label={t('auth:devices.current')}
                testID={`device-current-${info.id}`}
              />
            ) : null}
            <Button
              variant="danger"
              size="sm"
              loading={security.busy}
              label={t('auth:devices.revoke')}
              onPress={() => {
                void revoke(info.id, info.current);
              }}
              testID={`device-revoke-${info.id}`}
            />
          </Card>
        ))}
      <Text variant="caption" color="secondary" style={styles.note}>
        {t('auth:devices.serverNote')}
      </Text>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  note: { marginTop: 8 },
});
