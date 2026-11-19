// Home configuration contract (P07.1). The source is swappable:
// mock today, SettingsRepository later — consumers only see HomeConfig.
import type { Result } from '@/core/result';

export const HOME_SECTION_IDS = [
  'support-cases',
  'weddings',
  'offers',
  'souk',
  'jobs',
  'community-stats',
  'initiatives',
  'success-stories',
] as const;
export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];

export const HOME_QUICK_ACTION_IDS = [
  'assistance',
  'weddings',
  'offers',
  'souk',
  'jobs',
  'calculator',
  'guide',
] as const;
export type HomeQuickActionId = (typeof HOME_QUICK_ACTION_IDS)[number];

export interface HomeConfig {
  /** Ordered section ids (may include sections not yet registered). */
  readonly sections: readonly HomeSectionId[];
  readonly hiddenSections: readonly HomeSectionId[];
  readonly hiddenQuickActions: readonly HomeQuickActionId[];
}

export interface HomeConfigSource {
  readonly id: string;
  load(): Promise<Result<HomeConfig>>;
}
