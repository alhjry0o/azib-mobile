// Internal developer settings (hidden in production by app/(dev)/_layout.tsx).
// Every control writes to a real store/provider and gives immediate feedback.
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Badge,
  Button,
  Card,
  Icon,
  ListItem,
  Screen,
  SegmentedControl,
  Switch,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useLanguageSwitch } from '@/features/shell/use-language-switch';
import { useDeviceTier, useDeviceTierStore, useDirection, useHapticsStore } from '@/hooks';
import type { DeviceTier } from '@/hooks';
import { useAppModeStore, useOnboardingStore, useShellStore } from '@/stores';
import type { AppMode } from '@/stores';
import { useTheme } from '@/theme';
import { useDemoSeed } from './use-demo-seed';

type TierChoice = DeviceTier | 'auto';

function DevSection({
  title,
  description,
  testID,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly testID?: string;
  readonly children: ReactNode;
}) {
  const theme = useTheme();
  return (
    <Card testID={testID} style={{ gap: theme.spacing[3] }}>
      <Text variant="h3">{title}</Text>
      {description ? (
        <Text variant="caption" color="secondary">
          {description}
        </Text>
      ) : null}
      {children}
    </Card>
  );
}

export function DevSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { direction, isRTL } = useDirection();
  const queryClient = useQueryClient();
  const mode = useAppModeStore((s) => s.mode);
  const setMode = useAppModeStore((s) => s.setMode);
  const override = useDeviceTierStore((s) => s.override);
  const setOverride = useDeviceTierStore((s) => s.setOverride);
  const { tier } = useDeviceTier();
  const { language, switchLanguage } = useLanguageSwitch();
  const hapticsEnabled = useHapticsStore((s) => s.enabled);
  const setHapticsEnabled = useHapticsStore((s) => s.setEnabled);
  const unread = useShellStore((s) => s.unreadNotifications);
  const setUnread = useShellStore((s) => s.setUnreadNotifications);
  const openDialog = useShellStore((s) => s.openDialog);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const demoSeed = useDemoSeed();

  const changeMode = (next: AppMode): void => {
    if (next === mode) return;
    setMode(next);
    queryClient.clear();
  };

  const confirmResetOnboarding = (): void => {
    openDialog({
      title: t('common:shell.dev.resetOnboarding.title'),
      description: t('common:shell.dev.resetOnboarding.description'),
      confirmLabel: t('common:shell.dev.resetOnboarding.confirm'),
      cancelLabel: t('common:buttons.cancel'),
      destructive: true,
      onConfirm: () => {
        resetOnboarding();
        router.replace(href(ROUTES.onboarding));
      },
    });
  };

  const createdTotal = demoSeed.summary
    ? Object.values(demoSeed.summary.created).reduce((sum, value) => sum + value, 0)
    : 0;

  return (
    <Screen
      scroll
      testID="dev-settings-screen"
      contentStyle={{ paddingBottom: theme.spacing[12], gap: theme.spacing[4] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:shell.dev.backToAccount')}
        onPress={() => router.replace(href(ROUTES.tabs.account))}
        testID="dev-back"
        style={styles.backButton}
      />
      <View
        style={[
          styles.titleRow,
          { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[3] },
        ]}
      >
        <Text variant="h1" style={styles.title}>
          {t('common:shell.dev.title')}
        </Text>
        <Badge variant="accent" label={t('common:shell.dev.badgeLabel')} testID="dev-badge" />
      </View>
      <Text variant="body" color="secondary">
        {t('common:shell.dev.description')}
      </Text>

      <DevSection
        title={t('common:shell.dev.mode.title')}
        description={t('common:shell.dev.mode.description')}
        testID="dev-mode-card"
      >
        <SegmentedControl
          segments={[
            { value: 'demo' as const, label: t('common:shell.dev.mode.demo') },
            { value: 'backend' as const, label: t('common:shell.dev.mode.backend') },
          ]}
          value={mode}
          onChange={changeMode}
          testID="dev-mode-control"
        />
      </DevSection>

      <DevSection
        title={t('home:dev.title')}
        description={t('home:dev.description')}
        testID="dev-demo-seed-card"
      >
        <Button
          fullWidth
          loading={demoSeed.busy}
          disabled={!demoSeed.isDemo}
          leftIcon="sparkles"
          label={t('home:dev.action')}
          onPress={() => {
            void demoSeed.run();
          }}
          testID="dev-demo-seed"
        />
        {demoSeed.summary ? (
          <Text variant="caption" color="secondary" testID="dev-demo-seed-summary">
            {t('home:dev.summary', {
              created: createdTotal,
              published: demoSeed.summary.published,
              offers: demoSeed.summary.linkedOffers,
            })}
          </Text>
        ) : null}
        {!demoSeed.isDemo ? (
          <Text variant="caption" color="secondary" testID="dev-demo-seed-unavailable">
            {t('home:dev.demoOnly')}
          </Text>
        ) : null}
      </DevSection>

      <DevSection
        title={t('common:shell.dev.tier.title')}
        description={t('common:shell.dev.tier.description', { tier })}
        testID="dev-tier-card"
      >
        <SegmentedControl<TierChoice>
          segments={[
            { value: 'auto', label: t('common:shell.dev.tier.auto') },
            { value: 'high', label: t('common:shell.dev.tier.high') },
            { value: 'mid', label: t('common:shell.dev.tier.mid') },
            { value: 'low', label: t('common:shell.dev.tier.low') },
          ]}
          value={override ?? 'auto'}
          onChange={(value) => setOverride(value === 'auto' ? null : value)}
          testID="dev-tier-control"
        />
      </DevSection>

      <DevSection
        title={t('common:shell.dev.language.title')}
        description={t('common:shell.dev.language.description', { direction })}
        testID="dev-language-card"
      >
        <SegmentedControl
          segments={[
            { value: 'ar' as const, label: t('common:language.arabic') },
            { value: 'en' as const, label: t('common:language.english') },
          ]}
          value={language}
          onChange={(value) => {
            void switchLanguage(value);
          }}
          testID="dev-language-control"
        />
        <Text variant="caption" color="secondary">
          {t('common:shell.dev.language.note')}
        </Text>
      </DevSection>

      <DevSection
        title={t('common:shell.dev.haptics.title')}
        description={t('common:shell.dev.haptics.description')}
        testID="dev-haptics-card"
      >
        <Switch
          value={hapticsEnabled}
          onValueChange={setHapticsEnabled}
          label={t('common:shell.dev.haptics.toggle')}
          testID="dev-haptics-switch"
        />
      </DevSection>

      <DevSection
        title={t('common:shell.dev.dockBadge.title')}
        description={t('common:shell.dev.dockBadge.description')}
        testID="dev-badge-card"
      >
        <View
          style={[
            styles.badgeRow,
            { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[3] },
          ]}
        >
          <Button
            variant="icon"
            size="sm"
            leftIcon="minus"
            accessibilityLabel={t('common:shell.dev.dockBadge.decrease')}
            disabled={unread === 0}
            onPress={() => setUnread(unread - 1)}
            testID="dev-badge-minus"
          />
          <Text variant="h3" testID="dev-badge-count">
            {String(unread)}
          </Text>
          <Button
            variant="icon"
            size="sm"
            leftIcon="plus"
            accessibilityLabel={t('common:shell.dev.dockBadge.increase')}
            onPress={() => setUnread(unread + 1)}
            testID="dev-badge-plus"
          />
        </View>
      </DevSection>

      <DevSection title={t('common:shell.dev.links.title')} testID="dev-links-card">
        <ListItem
          variant="card"
          title={t('assistance:dev.title')}
          leading={<Icon name="wallet" size={20} />}
          onPress={() => router.push(href(ROUTES.devAssistance))}
          testID="dev-assistance-link"
        />
        <ListItem
          variant="card"
          title={t('assistance:finance.dev.title')}
          leading={<Icon name="creditCard" size={20} />}
          onPress={() => router.push(href(ROUTES.devFinance))}
          testID="dev-finance-link"
        />
        <ListItem
          variant="card"
          title={t('common:shell.dev.links.integrations')}
          leading={<Icon name="info" size={20} />}
          onPress={() => router.push(href(ROUTES.devIntegrations))}
          testID="dev-integrations-link"
        />
        <ListItem
          variant="card"
          title={t('common:shell.dev.links.gallery')}
          leading={<Icon name="sparkles" size={20} />}
          onPress={() => router.push(href(ROUTES.gallery))}
          testID="dev-gallery-link"
        />
      </DevSection>

      <Button
        variant="danger"
        fullWidth
        label={t('common:shell.dev.resetOnboarding.action')}
        onPress={confirmResetOnboarding}
        testID="dev-reset-onboarding"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: { alignSelf: 'flex-start', marginTop: 8 },
  titleRow: { alignItems: 'center', marginTop: 4 },
  title: { flex: 1 },
  badgeRow: { alignItems: 'center', justifyContent: 'center' },
});
