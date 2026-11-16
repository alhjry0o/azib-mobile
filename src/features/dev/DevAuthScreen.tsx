// Demo-only auth tools: role switcher, session inspector, live demo code.
// Hidden in production by app/(dev)/_layout.tsx. Never grants real access.
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  Card,
  NotConnectedState,
  Screen,
  Switch,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useSession } from '@/features/shell/use-session';
import { AUTH_ROLES, type AuthRole } from '@/providers';
import { isMockAuthProvider } from '@/providers/mock';
import { useProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { useTheme } from '@/theme';

export function DevAuthScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();
  const session = useSession();
  const challenge = useAuthStore((s) => s.challenge);
  const [busy, setBusy] = useState(false);

  const mock = isMockAuthProvider(container.auth) ? container.auth : null;
  const user = session.result?.ok ? (session.result.value?.user ?? null) : null;
  const roles = user?.roles ?? [];

  if (!mock) {
    return (
      <Screen testID="dev-auth-screen" style={{ justifyContent: 'center' }}>
        <NotConnectedState
          title={t('auth:devTools.notDemo')}
          description={t('auth:notConnected.description')}
          onRetry={session.refetch}
        />
      </Screen>
    );
  }

  const refresh = async (): Promise<void> => {
    setBusy(true);
    const result = await container.auth.getSession();
    if (result.ok) session.setSession(result.value);
    setBusy(false);
  };

  const toggleRole = async (role: AuthRole, enabled: boolean): Promise<void> => {
    const next = new Set<AuthRole>(roles);
    if (enabled) next.add(role);
    else next.delete(role);
    mock.__setRoles([...next]);
    await refresh();
  };

  const signOut = async (): Promise<void> => {
    setBusy(true);
    await container.auth.signOut();
    session.setSession(null);
    setBusy(false);
  };

  return (
    <Screen
      scroll
      testID="dev-auth-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.tabs.account))}
        testID="dev-auth-back"
        style={{ alignSelf: 'flex-start', marginTop: theme.spacing[2] }}
      />
      <Text variant="h1">{t('auth:devTools.title')}</Text>
      <Text variant="body" color="secondary">
        {t('auth:devTools.subtitle')}
      </Text>
      <Badge variant="demo" label={t('common:demo.badge')} testID="dev-auth-demo-badge" />
      <Button
        variant="secondary"
        fullWidth
        loading={busy}
        label={t('auth:devTools.refresh')}
        onPress={() => {
          void refresh();
        }}
        testID="dev-auth-refresh"
      />
      {challenge?.demoCode ? (
        <Card testID="dev-auth-code-card">
          <Text variant="caption" color="secondary">
            {t('auth:devTools.demoCodeTitle')}
          </Text>
          <Text variant="h2" color="gold" testID="dev-auth-code">
            {challenge.demoCode}
          </Text>
        </Card>
      ) : null}
      {user ? (
        <Card testID="dev-auth-session-card">
          <Text variant="caption" color="secondary">
            {t('auth:devTools.sessionTitle')}
          </Text>
          <Text variant="bodyStrong" testID="dev-auth-user-id">{user.id}</Text>
          <Text variant="caption" color="secondary">
            {user.email ?? user.phone ?? user.displayName}
          </Text>
        </Card>
      ) : (
        <Text variant="body" color="secondary" testID="dev-auth-no-session">
          {t('auth:devTools.noSession')}
        </Text>
      )}
      <Text variant="h3">{t('auth:devTools.rolesTitle')}</Text>
      <Text variant="caption" color="secondary">
        {t('auth:devTools.rolesHint')}
      </Text>
      {AUTH_ROLES.map((role) => (
        <Switch
          key={role}
          testID={`dev-role-${role}`}
          value={roles.includes(role)}
          disabled={!user}
          label={t(`auth:roles.${role}`)}
          onValueChange={(enabled) => {
            void toggleRole(role, enabled);
          }}
        />
      ))}
      <Button
        variant="danger"
        fullWidth
        disabled={!user}
        label={t('auth:devTools.signOut')}
        onPress={() => {
          void signOut();
        }}
        testID="dev-auth-sign-out"
      />
    </Screen>
  );
}
