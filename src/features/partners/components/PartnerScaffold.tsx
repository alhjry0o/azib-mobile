import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Badge, Button, NotConnectedState, Screen, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import { useTheme } from '@/theme';

export interface PartnerScaffoldProps {
  readonly testID: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly backTo?: string;
  readonly guardBackend?: boolean;
  readonly notConnectedRetry?: () => void;
  readonly children: ReactNode;
}

export function PartnerScaffold({
  testID,
  title,
  subtitle,
  backTo = ROUTES.partners.root,
  guardBackend = true,
  notConnectedRetry,
  children,
}: PartnerScaffoldProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();

  if (guardBackend && container.mode !== 'demo') {
    return (
      <Screen testID={testID} style={styles.center}>
        <NotConnectedState
          title={t('marketplace:browser.notConnected')}
          description={t('marketplace:browser.notConnectedDescription')}
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
      {container.mode === 'demo' ? (
        <Badge variant="demo" label={t('marketplace:demo.partnerBadge')} testID={`${testID}-demo`} />
      ) : null}
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginTop: 8 },
});
