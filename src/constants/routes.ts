// Single source of truth for all app routes (P05 → P11).
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
  profile: { root: '/profile', edit: '/profile/edit' },
  assistance: {
    root: '/assistance',
    conditions: '/assistance/conditions',
    preCheck: '/assistance/pre-check',
    new: '/assistance/new',
    mine: '/assistance/mine',
    detail: (id: string): string => `/assistance/${id}`,
    infoRequest: (id: string): string => `/assistance/${id}/info-request`,
    decision: (id: string): string => `/assistance/${id}/decision`,
    appeal: (id: string): string => `/assistance/${id}/appeal`,
  },
  programs: {
    root: '/programs',
    donations: '/programs/donations',
    receipts: '/programs/receipts',
    disbursements: '/programs/disbursements',
    impact: '/programs/impact',
    providerRequirements: '/programs/provider-requirements',
    detail: (id: string): string => `/programs/${id}`,
    kind: (kind: string): string => `/programs/kind/${kind}`,
    donate: (id: string): string => `/programs/donate/${id}`,
  },
  weddings: {
    root: '/weddings',
    new: '/weddings/new',
    detail: (id: string): string => `/weddings/${id}`,
    members: (id: string): string => `/weddings/${id}/members`,
    polls: (id: string): string => `/weddings/${id}/polls`,
    budget: (id: string): string => `/weddings/${id}/budget`,
    agreement: (id: string): string => `/weddings/${id}/agreement`,
    chat: (id: string): string => `/weddings/${id}/chat`,
    countdown: (id: string): string => `/weddings/${id}/countdown`,
    completion: (id: string): string => `/weddings/${id}/completion`,
    services: (id: string): string => `/weddings/${id}/services`,
  },
  // D-5: the tab stays the browser; app/partners has NO index.tsx.
  partners: {
    root: '/partners',
    saved: '/partners/saved',
    register: '/partners/register',
    dashboard: '/partners/dashboard',
    ambassador: '/partners/ambassador',
    offerNew: '/partners/offers/new',
    offerEdit: (offerId: string): string => `/partners/offers/edit/${offerId}`,
    profile: (id: string): string => `/partners/${id}`,
    offers: (id: string): string => `/partners/${id}/offers`,
    offer: (offerId: string): string => `/partners/offers/${offerId}`,
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
    security: '/settings/security',
    devices: '/settings/devices',
    deleteAccount: '/settings/delete-account',
    exportData: '/settings/export-data',
  },
  legal: {
    terms: '/legal/terms',
    privacy: '/legal/privacy',
    eligibility: '/legal/eligibility',
    weddingsWithdrawal: '/legal/weddings-withdrawal',
    souk: '/legal/souk',
  },
  features: {
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
  devAssistance: '/(dev)/assistance',
  devFinance: '/(dev)/finance',
  devPartners: '/(dev)/partners',
  gallery: '/(dev)/gallery',
  maintenance: '/maintenance',
  notFound: '/+not-found',
} as const;

export function href(path: string): Href {
  return path as Href;
}

export function legalDocPath(slug: string): string {
  return `/legal/${slug}`;
}

export const TAB_ORDER = ['home', 'services', 'weddings', 'partners', 'account'] as const;
export type TabKey = (typeof TAB_ORDER)[number];

export interface TabConfig {
  readonly key: TabKey;
  readonly route: string;
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
