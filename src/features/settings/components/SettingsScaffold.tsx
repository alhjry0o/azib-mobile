import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Button, NotConnectedState, Screen, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useSession } from '@/features/shell/use-session';
import { useProviderContainer } from '@/providers';
import { useTheme } from '@/theme';

export interface SettingsScaffoldProps {
  readonly testID: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly backTo?: string;
  /** Server-dependent screens show an honest NotConnected in backend mode. */
  readonly guardBackend?: boolean;
  readonly children: ReactNode;
}

export function SettingsScaffold({
  testID,
  title,
  subtitle,
  backTo = ROUTES.settings.root,
  guardBackend = false,
  children,
}: SettingsScaffoldProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();
  const session = useSession();

  if (guardBackend && container.mode === 'backend') {
    return (
      <Screen testID={testID} style={styles.center}>
        <NotConnectedState
          title={t('profile:settings.notConnected')}
          description={t('profile:settings.serverNote')}
          onRetry={session.refetch}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      testID={testID}
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(backTo))}
        testID={`${testID}-back`}
        style={styles.back}
      />
      <Text variant="h1">{title}</Text>
      {subtitle ? (
        <Text variant="body" color="secondary">
          {subtitle}
        </Text>
      ) : null}
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginTop: 8 },
});
