// The 14 marketplace categories (HRD P11 §4). Labels are i18n keys.
export const PARTNER_CATEGORIES = [
  'halls',
  'furniture',
  'appliances',
  'gold',
  'clothing',
  'photography',
  'kitchens',
  'textiles',
  'restaurants',
  'baraa',
  'artists',
  'sound_light',
  'transport',
  'home_maintenance',
] as const;

export type PartnerCategory = (typeof PARTNER_CATEGORIES)[number];

export function isPartnerCategory(value: string): value is PartnerCategory {
  return (PARTNER_CATEGORIES as readonly string[]).includes(value);
}

export function categoryLabelKey(category: string): string {
  return isPartnerCategory(category)
    ? `marketplace:categories.${category}`
    : 'marketplace:categories.other';
}
