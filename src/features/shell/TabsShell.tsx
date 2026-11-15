// Tabs group shell: gate + native Tabs (hidden bar) + FloatingDock overlay.
import { Redirect, Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ErrorState, NotConnectedState, Screen } from '@/components/ui';
import { FloatingDock, GateLoading } from '@/components/shell';
import { ROUTES, href } from '@/constants/routes';
import { useShellGate } from './use-shell-gate';

const hiddenTabBar = () => null;

export function TabsShell() {
  const gate = useShellGate();
  const { t } = useTranslation();

  if (gate.status === 'loading') return <GateLoading />;
  if (gate.status === 'onboarding') return <Redirect href={href(ROUTES.onboarding)} />;
  if (gate.status === 'auth') return <Redirect href={href(ROUTES.signIn)} />;
  if (gate.status === 'not-connected') {
    return (
      <Screen testID="tabs-not-connected" style={styles.center}>
        <NotConnectedState
          title={t('common:shell.notConnected.title')}
          description={t('common:shell.notConnected.description')}
          onRetry={gate.refetch}
        />
      </Screen>
    );
  }
  if (gate.status === 'error') {
    return (
      <Screen testID="tabs-error" style={styles.center}>
        <ErrorState
          title={t('common:shell.error.title')}
          description={t('common:shell.error.description')}
          onRetry={gate.refetch}
        />
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      <Tabs tabBar={hiddenTabBar} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="services" />
        <Tabs.Screen name="weddings" />
        <Tabs.Screen name="partners" />
        <Tabs.Screen name="account" />
      </Tabs>
      <FloatingDock />
    </View>
  );
)

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { justifyContent: 'center' },
});
