// Honest auth placeholder (real auth ships in P06).
// Demo mode: working sign-in through the SAME AuthProvider contract (mock).
// Backend mode: truthful NotConnected with a working retry.
import { useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ArchHero } from '@/components/brand';
import { Badge, Button, NotConnectedState, Screen, Text, useToast } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import { useTheme } from '@/theme';
import { useSession } from './use-session';

// Non-secret demo credentials. The mock provider accepts any non-empty pair.
const DEMO_CREDENTIALS = { email: 'demo@azib.invalid', password: 'demo-placeholder' } as const;

export function SignInPlaceholder() {
  const container = useProviderContainer();
  const session = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const theme = useTheme();
  const [busy, setBusy] = useState(false);

  if (session.result?.ok && session.result.value !== null) {
    return <Redirect href={href(ROUTES.tabs.home)} />;
  }

  const signInDemo = async (): Promise<void> => {
    setBusy(true);
    const result = await container.auth.signIn(DEMO_CREDENTIALS);
    setBusy(false);
    if (result.ok) {
      session.setSession(result.value);
      router.replace(href(ROUTES.tabs.home));
    } else {
      toast.show({ message: t('common:shell.error.description'), variant: 'error' });
    }
  };

  if (container.mode === 'backend') {
    return (
      <Screen testID="sign-in-screen" style={styles.center}>
        <NotConnectedState
          title={t('common:shell.auth.backendTitle')}
          description={t('common:shell.auth.backendDescription')}
          onRetry={session.refetch}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll testID="sign-in-screen" contentStyle={styles.content}>
      <View style={styles.hero}>
        <ArchHero width={200} variant="outlined">
          <Text variant="h1" color="gold" align="center">
            {t('common:appName')}
          </Text>
        </ArchHero>
      </View>
      <Text variant="h2" align="center">
        {t('common:shell.auth.title')}
      </Text>
      <Text variant="body" color="secondary" align="center">
        {t('common:shell.auth.description')}
      </Text>
      <View style={styles.badgeRow}>
        <Badge variant="demo" label={t('common:demo.badge')} testID="sign-in-demo-badge" />
      </View>
      <Button
        fullWidth
        loading={busy}
        label={t('common:shell.auth.demoAction')}
        onPress={() => {
          void signInDemo();
        }}
        testID="demo-sign-in"
      />
      <View style={{ height: theme.spacing[12] }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  content: { flexGrow: 1, justifyContent: 'center', gap: 16 },
  hero: { alignItems: 'center' },
  badgeRow: { alignItems: 'center' },
});
