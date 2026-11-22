// Deep-link allowlist for the azib:// scheme (P05 → P09).
// Query strings and fragments are dropped entirely: no sensitive data in links.
// Dynamic assistance/programs paths are allowed by prefix; the screens
// themselves enforce authentication + ownership (RLS lands in P18).
import { stripGroups } from './routing';

export type DeepLinkResolution =
  | { readonly kind: 'allow'; readonly path: string }
  | { readonly kind: 'guarded'; readonly path: string }
  | { readonly kind: 'not-found'; readonly path: string }
  | { readonly kind: 'ignore' };

const ALLOWED: ReadonlySet<string> = new Set([
  '/',
  '/index',
  '/welcome',
  '/sign-in',
  '/sign-up',
  '/verify',
  '/forgot-password',
  '/reset-password',
  '/maintenance',
  '/services',
  '/weddings',
  '/partners',
  '/account',
  '/profile',
  '/profile/edit',
  '/assistance',
  '/assistance/conditions',
  '/assistance/pre-check',
  '/assistance/new',
  '/assistance/mine',
  '/programs',
  '/programs/donations',
  '/programs/receipts',
  '/programs/disbursements',
  '/programs/impact',
  '/programs/provider-requirements',
  '/settings',
  '/settings/account',
  '/settings/language',
  '/settings/appearance',
  '/settings/numbers',
  '/settings/notifications',
  '/settings/privacy',
  '/settings/help',
  '/settings/about',
  '/settings/security',
  '/settings/devices',
  '/settings/delete-account',
  '/settings/export-data',
  '/legal/terms',
  '/legal/privacy',
  '/legal/eligibility',
  '/legal/weddings-withdrawal',
  '/legal/souk',
  '/souk',
  '/jobs',
  '/volunteers',
  '/learn',
  '/calculator',
  '/guide',
  '/notifications',
  '/search',
]);

const ALLOWED_PREFIXES: readonly string[] = ['/assistance/', '/programs/'];
const GUARDED_PREFIXES: readonly string[] = ['/onboarding', '/staff', '/dev', '/gallery'];

export function parseAzibUrl(url: string): string | null {
  const match = /^azib:\/\/(.*)$/i.exec(url.trim());
  if (!match) return null;
  const rest = (match[1] ?? '').split(/[?#]/)[0] ?? '';
  const withSlash = rest.startsWith('/') ? rest : `/${rest}`;
  const stripped = stripGroups(withSlash);
  if (stripped.length > 1 && stripped.endsWith('/')) {
    return stripped.slice(0, -1);
  }
  return stripped;
}

export function resolveDeepLink(url: string | null | undefined): DeepLinkResolution {
  if (!url) return { kind: 'ignore' };
  const path = parseAzibUrl(url);
  if (path === null) return { kind: 'ignore' };
  if (ALLOWED.has(path)) return { kind: 'allow', path };
  const guarded = GUARDED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
  if (guarded) return { kind: 'guarded', path };
  if (ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return { kind: 'allow', path };
  }
  return { kind: 'not-found', path };
}
