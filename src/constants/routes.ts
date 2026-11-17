// Single source of truth for all app routes (P05 + P06).
// No Arabic strings here. href() casts to expo-router's Href so typed-routes
// generation (when present) stays satisfied without duplicating path literals.
import type { Href } from 'expo-router';
import type { IconName } from '@/components/ui';

export const ROUTES = {
  root: '/',
  onboarding: '/(onboarding)',
  signIn: '/(auth)/sign-in',
  auth: {
    welcome: '/(auth)/welcome',
    signIn: '/(auth)/sign-in',
    signUp: '/(auth)/sign-up',
    verify: '/(auth)/verify',
    forgotPassword: '/(auth)/forgot-password',
    resetPassword: '/(auth)/reset-password',
  },
  tabs: {
    home: '/(tabs)',
    services: '/(tabs)/services',
    weddings: '/(tabs)/weddings',
    partners: '/(tabs)/partners',
    account: '/(tabs)/account',
  },
  profile: {
    root: '/profile',
    edit: '/profile/edit',
  },
  settings: {
    root: '/settings',
    account: '/settings/account',
    language: '/settings/language',
    appearance: '/settings/appearance',
    numbers: '/settings/numbers',
    notifications: '/settings/notifications',
    privacy: '/settings/privacy',
    help: '/settings/help',
    about: '/settings/about',
  },
  features: {
    assistance: '/(features)/assistance',
    souk: '/(features)/souk',
    jobs: '/(features)/jobs',
    volunteers: '/(features)/volunteers',
    learn: '/(features)/learn',
    calculator: '/(features)/calculator',
    guide: '/(features)/guide',
    notifications: '/(features)/notifications',
    search: '/(features)/search',
  },
  staff: '/(staff)',
  dev: '/(dev)',
  devIntegrations: '/(dev)/integrations',
  devAuth: '/(dev)/auth',
  gallery: '/(dev)/gallery',
  maintenance: '/maintenance',
  notFound: '/+not-found',
} as const;

export function href(path: string): Href {
  return path as Href;
}

export const TAB_ORDER = ['home', 'services', 'weddings', 'partners', 'account'] as const;
export type TabKey = (typeof TAB_ORDER)[number];

export interface TabConfig {
  readonly key: TabKey;
  /** Router target (group-qualified, for navigation). */
  readonly route: string;
  /** URL path (groups stripped, for active matching). */
  readonly path: string;
  readonly icon: IconName;
  readonly labelKey: string;
  readonly center?: boolean;
}

export const TABS: readonly TabConfig[] = [
  { key: 'home', route: ROUTES.tabs.home, path: '/', icon: 'home', labelKey: 'common:shell.tabs.home' },
  { key: 'services', route: ROUTES.tabs.services, path: '/services', icon: 'menu', labelKey: 'common:shell.tabs.services' },
  { key: 'weddings', route: ROUTES.tabs.weddings, path: '/weddings', icon: 'heart', labelKey: 'common:shell.tabs.weddings', center: true },
  { key: 'partners', route: ROUTES.tabs.partners, path: '/partners', icon: 'users', labelKey: 'common:shell.tabs.partners' },
  { key: 'account', route: ROUTES.tabs.account, path: '/account', icon: 'user', labelKey: 'common:shell.tabs.account' },
] as const;
