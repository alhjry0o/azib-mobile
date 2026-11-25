import type { SoukCondition, SoukDeliveryMethod, SoukItem } from '@/repositories/contracts/souk';
import { toItemWorkflowStatus } from './item-machine';

export const SOUK_CATEGORIES = [
  'furniture',
  'appliances',
  'kitchenware',
  'textiles',
  'home_essentials',
  'electronics',
  'baby_items',
  'books',
  'medical_devices',
  'free_services',
  'other',
] as const;
export type SoukCategory = (typeof SOUK_CATEGORIES)[number];

export function isSoukCategory(value: string): value is SoukCategory {
  return (SOUK_CATEGORIES as readonly string[]).includes(value);
}

export function categoryLabelKey(category: string): string {
  return isSoukCategory(category)
    ? `marketplace:souk.categories.${category}`
    : 'marketplace:souk.categories.other';
}

export interface SoukFilters {
  readonly text: string;
  readonly category: string | null;
  readonly governorateId: string | null;
  readonly condition: SoukCondition | null;
  readonly deliveryMethod: SoukDeliveryMethod | null;
  readonly includeUnavailable: boolean;
}

export const DEFAULT_SOUK_FILTERS: SoukFilters = Object.freeze({
  text: '',
  category: null,
  governorateId: null,
  condition: null,
  deliveryMethod: null,
  includeUnavailable: false,
});

function matches(text: readonly (string | null | undefined)[], needle: string): boolean {
  const query = needle.trim().toLowerCase();
  if (query.length === 0) return true;
  return text.some((value) => (value ?? '').toLowerCase().includes(query));
}

export function filterItems(
  items: readonly SoukItem[],
  filters: SoukFilters,
): readonly SoukItem[] {
  return items.filter((item) => {
    const status = toItemWorkflowStatus(item.status);
    if (!filters.includeUnavailable && status !== 'available') return false;
    if (filters.includeUnavailable && (status === 'draft' || status === 'pending_review')) {
      return false;
    }
    if (filters.category && item.category !== filters.category) return false;
    if (filters.governorateId && item.governorateId !== filters.governorateId) return false;
    if (filters.condition && (item.condition ?? 'good') !== filters.condition) return false;
    if (
      filters.deliveryMethod &&
      (item.deliveryMethod ?? 'self_pickup') !== filters.deliveryMethod
    ) {
      return false;
    }
    return matches([item.title, item.titleKey, item.description], filters.text);
  });
}

export function hasActiveSoukFilters(filters: SoukFilters): boolean {
  return (
    filters.text.trim().length > 0 ||
    filters.category !== null ||
    filters.governorateId !== null ||
    filters.condition !== null ||
    filters.deliveryMethod !== null ||
    filters.includeUnavailable
  );
}
