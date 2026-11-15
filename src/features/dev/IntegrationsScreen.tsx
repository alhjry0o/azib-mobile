// Live IntegrationRegistry view. Reads real provider status and runs the
// container's actual healthCheckAll(). No invented connection states.
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Button,
  Icon,
  ListItem,
  Screen,
  Text,
  type BadgeVariant,
  type IconName,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import type { IntegrationRecord, ProviderStatus } from '@/providers';
import { useTheme } from '@/theme';

function statusMeta(status: ProviderStatus): { variant: BadgeVariant; icon: IconName } {
  switch (status) {
    case 'connected':
      return { variant: 'success', icon: 'checkCircle' };
    case 'mock':
      return { variant: 'demo', icon: 'sparkles' };
    case 'configured':
      return { variant: 'info', icon: 'info' };
    case 'error':
      return { variant: 'danger', icon: 'alertCircle' };
    case 'disabled':
      return { variant: 'neutral', icon: 'minus' };
  }
}

export function IntegrationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();
  const [records, setRecords] = useState<readonly IntegrationRecord[]>(() =>
    container.registry.list(),
  );
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setRecords(container.registry.list());
  }, [container]);

  const runHealthChecks = async (): Promise<void> => {
    setChecking(true);
    try {
      await container.healthCheckAll();
      setRecords(container.registry.list());
    } finally {
      setChecking(false);
    }
  };

  return (
    <Screen
      scroll
      testID="integrations-screen"
      contentStyle={{ paddingBottom: theme.spacing[12], gap: theme.spacing[3] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.dev))}
        testID="integrations-back"
        style={{ alignSelf: 'flex-start', marginTop: theme.spacing[2] }}
      />
      <Text variant="h1">{t('common:shell.dev.integrations.title')}</Text>
      <Text variant="body" color="secondary">
        {t('common:shell.dev.integrations.description')}
      </Text>
      <Badge
        variant={container.mode === 'demo' ? 'demo' : 'neutral'}
        label={t('common:shell.dev.integrations.mode', { mode: container.mode })}
        testID="integrations-mode-badge"
      />
      <Button
        fullWidth
        loading={checking}
        label={t('common:shell.dev.integrations.runChecks')}
        onPress={() => {
          void runHealthChecks();
        }}
        testID="run-health-checks"
      />
      {records.map((record) => {
        const meta = statusMeta(record.status);
        return (
          <ListItem
            key={record.name}
            variant="card"
            title={record.name}
            subtitle={
              record.lastCheckedAt
                ? new Date(record.lastCheckedAt).toISOString()
                : t('common:shell.dev.integrations.notChecked')
            }
            leading={<Icon name={meta.icon} size={20} />}
            trailing={
              <Badge
                variant={meta.variant}
                size="sm"
                label={t(`common:shell.dev.integrations.status.${record.status}`)}
                testID={`integration-status-${record.name}`}
              />
            }
            testID={`integration-${record.name}`}
          />
        );
      })}
    </Screen>
  );
}
