// Shared layout for every auth screen: back, title, subtitle, demo badge,
// and an honest NotConnected gate in backend mode.
import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Badge, Button, NotConnectedState, Screen, Text } from '@/components/ui';
import { href } from '@/constants/routes';
import { useSession } from '@/features/shell/use-session';
import { useProviderContainer } from '@/providers';
import { useTheme } from '@/theme';

export interface AuthScaffoldProps {
  readonly testID: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly backTo?: string;
  /** Welcome is navigation-only and stays usable in backend mode. */
  readonly guardBackend?: boolean;
  readonly children: ReactNode;
}

export function AuthScaffold({
  testID,
  title,
  subtitle,
  backTo,
  guardBackend = true,
  children,
}: AuthScaffoldProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();
  const session = useSession();

  if (guardBackend && container.mode === 'backend') {
    return (
      <Screen testID={testID} style={styles.center}>
        <NotConnectedState
          title={t('auth:notConnected.title')}
          description={t('auth:notConnected.description')}
          onRetry={session.refetch}
          secondaryAction={
            backTo
              ? { label: t('common:buttons.back'), onPress: () => router.replace(href(backTo)) }
              : undefined
          }
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      testID={testID}
      contentStyle={[styles.content, { gap: theme.spacing[4], paddingBottom: theme.spacing[10] }]}
    >
      {backTo ? (
        <Button
          variant="ghost"
          size="sm"
          leftIcon="arrowLeft"
          label={t('common:buttons.back')}
          onPress={() => router.replace(href(backTo))}
          testID={`${testID}-back`}
          style={styles.back}
        />
      ) : null}
      <Text variant="h1">{title}</Text>
      {subtitle ? (
        <Text variant="body" color="secondary">
          {subtitle}
        </Text>
      ) : null}
      {container.mode === 'demo' ? (
        <Badge variant="demo" label={t('common:demo.badge')} testID={`${testID}-demo`} />
      ) : null}
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  content: { flexGrow: 1 },
  back: { alignSelf: 'flex-start', marginTop: 8 },
});
