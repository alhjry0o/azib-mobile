import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSharedValue } from 'react-native-reanimated';
import { Banner, Screen, Text } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { hasStaffRole } from '@/features/shell';
import { useProviderContainer } from '@/providers';
import { useShellStore } from '@/stores';
import { useTheme } from '@/theme';
import { HomeCustomizeSheet } from './components/HomeCustomizeSheet';
import { HomeHeader } from './components/HomeHeader';
import { HomeHero } from './components/HomeHero';
import { LazySection } from './components/LazySection';
import { QuickActions } from './components/QuickActions';
import { SectionErrorBoundary } from './components/SectionErrorBoundary';
import { Stagger } from './components/Stagger';
import type { HomeSectionId } from './config/home-config.types';
import { useHomeConfig } from './hooks/use-home-config';
import { SECTION_REGISTRY } from './sections/registry';
import { PartnerSummarySection } from './sections/role/PartnerSummarySection';
import { StaffShortcutSection } from './sections/role/StaffShortcutSection';
import { VolunteerSection } from './sections/role/VolunteerSection';

const EAGER_SECTIONS = 2;
/** Graceful fallback when viewability never reports (Jest / some web layouts). */
const VIEWABILITY_FALLBACK_MS = 700;

export function HomeScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const client = useQueryClient();
  const container = useProviderContainer();
  const config = useHomeConfig();
  const auth = useAuth();
  const openSheet = useShellStore((s) => s.openSheet);
  const heroProgress = useSharedValue(0);

  const [visibleIds, setVisibleIds] = useState<readonly string[]>([]);
  const [fallbackActive, setFallbackActive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFallbackActive(true), VIEWABILITY_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, []);

  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 35 }), []);
  const onViewableItemsChanged = useCallback(
    (info: { viewableItems: readonly { item: HomeSectionId }[] }) => {
      setVisibleIds(info.viewableItems.map((entry) => entry.item));
    },
    [],
  );
  
  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await client.invalidateQueries({ queryKey: ['home'] });
    setRefreshing(false);
  }, [client]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      // eslint-disable-next-line react-hooks/immutability
      heroProgress.value = Math.max(0, Math.min(1, y / 240));
    },
    [heroProgress],
  );

  const openCustomize = useCallback((): void => {
    openSheet({ title: t('home:customize.title'), content: <HomeCustomizeSheet /> });
  }, [openSheet, t]);

  const retrySection = useCallback(
    (id: HomeSectionId): void => {
      void client.invalidateQueries({ queryKey: ['home', container.mode, id] });
    },
    [client, container.mode],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<HomeSectionId>) => {
      const Section = SECTION_REGISTRY[item];
      if (!Section) return null;
      const active =
        fallbackActive || index < EAGER_SECTIONS || visibleIds.includes(item);
      return (
        <SectionErrorBoundary
          testID={`section-boundary-${item}`}
          onRetry={() => retrySection(item)}
        >
          <LazySection active={active} testID={`section-lazy-${item}`}>
            <Stagger index={index}>
              <Section />
            </Stagger>
          </LazySection>
        </SectionErrorBoundary>
      );
    },
    [fallbackActive, visibleIds, retrySection],
  );

  const roles = auth.user?.roles ?? [];
  const showStaff = auth.user !== null && hasStaffRole(auth.user);

  const header = (
    <View style={{ gap: theme.spacing[3] }}>
      <HomeHeader onCustomize={openCustomize} />
      <HomeHero progress={heroProgress} />
      <QuickActions />
      {roles.includes('partner_owner') ? <PartnerSummarySection /> : null}
      {roles.includes('volunteer') ? <VolunteerSection /> : null}
      {showStaff ? <StaffShortcutSection /> : null}
    </View>
  );

  const footer = (
    <View
      style={[
        styles.footer,
        { paddingHorizontal: theme.spacing[4], gap: theme.spacing[2] },
      ]}
    >
      {container.mode === 'demo' ? (
        <Banner variant="demo" message={t('home:demo.notice')} testID="home-demo-notice" />
      ) : null}
      <Text variant="caption" color="secondary" align="center">
        {t('home:footer')}
      </Text>
    </View>
  );

  return (
    <Screen testID="home-screen" paddingX={false}>
      <FlatList
        data={config.visibleSections}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        testID="home-list"
        initialNumToRender={EAGER_SECTIONS}
        maxToRenderPerBatch={2}
        windowSize={5}
        removeClippedSubviews
        onScroll={onScroll}
        scrollEventThrottle={16}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        contentContainerStyle={{ paddingBottom: theme.spacing[12], gap: theme.spacing[2] }}
        refreshing={refreshing}
        onRefresh={() => {
          void onRefresh();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { paddingTop: 16 },
});
