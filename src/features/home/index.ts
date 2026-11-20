export type {
  HomeConfig,
  HomeConfigSource,
  HomeQuickActionId,
  HomeSectionId,
} from './config/home-config.types';
export { HOME_QUICK_ACTION_IDS, HOME_SECTION_IDS } from './config/home-config.types';
export {
  DEFAULT_HOME_CONFIG,
  hiddenFromMap,
  hiddenQuickActionsFromMap,
  moveInList,
  normalizeOrder,
} from './config/default-home-config';
export {
  createMockHomeConfigSource,
  getHomeConfigSource,
  resetHomeConfigSource,
  setHomeConfigSource,
} from './config/home-config.source';
export type { HomeConfigApi } from './hooks/use-home-config';
export { useHomeConfig } from './hooks/use-home-config';
export type { HomeSectionApi, HomeSectionStatus } from './hooks/use-home-section';
export { homeSectionQueryKey, resolveSectionStatus, useHomeSection } from './hooks/use-home-section';
export { greetingKeyForHour, useHomeGreeting } from './hooks/use-home-greeting';
export type { HomeFormatters } from './hooks/use-home-formatters';
export { useHomeFormatters } from './hooks/use-home-formatters';
export type { PublicationConsent } from './consent-gate';
export { indexConsents, isConsentActive } from './consent-gate';
export type { PublicSupportCase, SupportCaseContext } from './anonymize';
export { PUBLISHABLE_STATUSES, selectPublicSupportCases, toPublicSupportCase } from './anonymize';
export type {
  CommunityStats,
  CommunityStatsBucket,
  CommunityStatsInput,
  OriginRecord,
  StatCell,
  StatValue,
} from './stats-privacy';
export {
  SMALL_NUMBER_THRESHOLD,
  buildStatCell,
  computeCommunityStats,
  suppressSmallNumber,
  totalRecordCount,
} from './stats-privacy';
export type { PublicStory } from './success-stories';
export { selectPublicStories } from './success-stories';
export { MAX_STAGGER_ITEMS, STAGGER_STEP_MS, Stagger } from './components/Stagger';
export { LazySection } from './components/LazySection';
export type { SectionShellEmptyAction } from './components/SectionShell';
export { SectionShell } from './components/SectionShell';
export { SectionErrorBoundary } from './components/SectionErrorBoundary';
export { HomeHeader } from './components/HomeHeader';
export { HomeHero } from './components/HomeHero';
export { QuickActions } from './components/QuickActions';
export { HomeCustomizeSheet } from './components/HomeCustomizeSheet';
export { REGISTERED_SECTION_IDS, SECTION_REGISTRY } from './sections/registry';
export { HomeScreen } from './HomeScreen';
