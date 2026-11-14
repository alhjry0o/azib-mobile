// Gate decision rendered at '/'. Redirect-only: no business logic in app/.
import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { ErrorState, NotConnectedState, Screen } from '@/components/ui';
import { GateLoading } from '@/components/shell';
import { ROUTES, href } from '@/constants/routes';
import { useShellGate } from './use-shell-gate';

export function GateScreen() {
  const gate = useShellGate();
  const { t } = useTranslation();

  switch (gate.status) {
    case 'loading':
      return <GateLoading />;
    case 'onboarding':
      return <Redirect href={href(ROUTES.onboarding)} />;
    case 'auth':
      return <Redirect href={href(ROUTES.signIn)} />;
    case 'ready':
      return <Redirect href={href(ROUTES.tabs.home)} />;
    case 'not-connected':
      return (
        <Screen testID="gate-not-connected" style={styles.center}>
          <NotConnectedState
            title={t('common:shell.notConnected.title')}
            description={t('common:shell.notConnected.description')}
            onRetry={gate.refetch}
          />
        </Screen>
      );
    case 'error':
      return (
        <Screen testID="gate-error" style={styles.center}>
          <ErrorState
            title={t('common:shell.error.title')}
            description={t('common:shell.error.description')}
            onRetry={gate.refetch}
          />
        </Screen>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
});
