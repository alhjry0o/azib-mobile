import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Badge, Button, NotConnectedState, Screen, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import { useTheme } from '@/theme';

export interface SoukScaffoldProps {
  readonly testID: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly backTo?: string;
  readonly notConnectedRetry?: () => void;
  readonly children: ReactNode;
}

export function SoukScaffold({
  testID,
  title,
  subtitle,
  backTo = ROUTES.souk.root,
  notConnectedRetry,
  children,
}: SoukScaffoldProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();

  if (container.mode !== 'demo') {
    return (
      <Screen testID={testID} style={styles.center}>
        <NotConnectedState
          title={t('marketplace:souk.browser.notConnected')}
          description={t('marketplace:souk.browser.notConnectedDescription')}
          onRetry={notConnectedRetry}
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
      <Badge variant="demo" label={t('marketplace:souk.demo.badge')} testID={`${testID}-demo`} />
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginTop: 8 },
});
