// Only sections that actually exist are registered. Unregistered ids stay in
// the config (for later phases) but never render and never appear in the
// customize sheet — no placeholders, no dead toggles.
import type { ComponentType } from 'react';
import type { HomeSectionId } from '../config/home-config.types';
import { JobsSection } from './JobsSection';
import { OffersSection } from './OffersSection';
import { SoukSection } from './SoukSection';
import { WeddingsSection } from './WeddingsSection';

export const SECTION_REGISTRY: Partial<Record<HomeSectionId, ComponentType>> = Object.freeze({
  weddings: WeddingsSection,
  offers: OffersSection,
  souk: SoukSection,
  jobs: JobsSection,
});

export const REGISTERED_SECTION_IDS: readonly HomeSectionId[] = Object.freeze([
  'weddings',
  'offers',
  'souk',
  'jobs',
] as const HomeSectionId[]);
