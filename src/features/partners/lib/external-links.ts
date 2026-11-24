// External link allowlist + builders (D-6). Pure: no Linking call here.
// The boundary module that actually opens URLs lands in P11.2.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import { cleanYemeniPhone } from './phone';

export type ExternalKind = 'tel' | 'whatsapp' | 'maps';
export type MapsPlatform = 'android' | 'ios' | 'web';

export const ALLOWED_EXTERNAL_PREFIXES: readonly string[] = Object.freeze([
  'tel:',
  'https://wa.me/',
  'geo:',
  'maps:',
  'https://maps.google.com/',
] as const);

export function isAllowedExternalUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  return ALLOWED_EXTERNAL_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

/** WhatsApp and Maps leave the app; tel is an explicit in-screen action. */
export function requiresConfirmation(kind: ExternalKind): boolean {
  return kind !== 'tel';
}

export function buildTelUrl(raw: string): Result<string> {
  const cleaned = cleanYemeniPhone(raw);
  if (!cleaned.ok) return cleaned;
  return ok(`tel:${cleaned.value.e164}`);
}

export function buildWhatsAppUrl(raw: string, message?: string): Result<string> {
  const cleaned = cleanYemeniPhone(raw);
  if (!cleaned.ok) return cleaned;
  const base = `https://wa.me/${cleaned.value.digits}`;
  const text = message?.trim() ?? '';
  return ok(text.length > 0 ? `${base}?text=${encodeURIComponent(text)}` : base);
}

export interface MapsTarget {
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly query?: string | null;
}

export function buildMapsUrl(target: MapsTarget, platform: MapsPlatform): Result<string> {
  const lat = target.latitude ?? null;
  const lng = target.longitude ?? null;
  const hasCoords =
    lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng);
  const query = (target.query ?? '').trim();
  if (!hasCoords && query.length === 0) {
    return { ok: false, error: AppError.validation({ code: 'NO_LOCATION' }) };
  }
  const value = hasCoords ? `${String(lat)},${String(lng)}` : encodeURIComponent(query);
  if (platform === 'android') return ok(`geo:0,0?q=${value}`);
  if (platform === 'ios') return ok(`maps:?q=${value}`);
  return ok(`https://maps.google.com/?q=${value}`);
}
