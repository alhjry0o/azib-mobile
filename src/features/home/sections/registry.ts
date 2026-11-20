// All eight home sections are implemented (P07.1 + P07.2).
// The config layer filters by this list, so adding a section here is the only
// step needed to make it appear and become customizable.
import type { ComponentType } from 'react';
import { HOME_SECTION_IDS, type HomeSectionId } from '../config/home-config.types';
import { CommunityStatsSection } from './CommunityStatsSection';
import { InitiativesSection } from './InitiativesSection';
import { JobsSection } from './JobsSection';
import { OffersSection } from './OffersSection';
import { SoukSection } from './SoukSection';
import { SuccessStoriesSection } from './SuccessStoriesSection';
import { SupportCasesSection } from './SupportCasesSection';
import { WeddingsSection } from './WeddingsSection';

export const SECTION_REGISTRY: Partial<Record<HomeSectionId, ComponentType>> = Object.freeze({
  'support-cases': SupportCasesSection,
  weddings: WeddingsSection,
  offers: OffersSection,
  souk: SoukSection,
  jobs: JobsSection,
  'community-stats': CommunityStatsSection,
  initiatives: InitiativesSection,
  'success-stories': SuccessStoriesSection,
});

export const REGISTERED_SECTION_IDS: readonly HomeSectionId[] = HOME_SECTION_IDS;
