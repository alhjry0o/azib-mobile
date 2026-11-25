// Anti-commodification lexicon. DETECTION DATA, not UI text: the marker below
// is the legitimate non-UI use of i18n-allow-arabic (D-9, precedent #13).
// A match produces a WARNING and a report path — never a silent block.
export const SALE_WORDS_AR: readonly string[] = ['بيع', 'للبيع', 'أبيع', 'سعر', 'بسعر', 'ريال', 'مقابل مبلغ', 'شراء', 'أشتري', 'مزايدة', 'دفع']; // i18n-allow-arabic

export const SALE_WORDS_EN: readonly string[] = [
  'sale',
  'sell',
  'selling',
  'price',
  'buy',
  'cash',
  'payment',
  'bid',
  'auction',
];

export interface SaleDetection {
  readonly flagged: boolean;
  readonly matches: readonly string[];
  readonly reasonKey: string | null;
}

export function detectSaleWords(text: string): SaleDetection {
  const lowered = text.toLowerCase();
  const matches: string[] = [];
  for (const word of SALE_WORDS_AR) {
    if (text.includes(word)) matches.push(word);
  }
  for (const word of SALE_WORDS_EN) {
    if (lowered.includes(word)) matches.push(word);
  }
  return Object.freeze({
    flagged: matches.length > 0,
    matches: Object.freeze(matches),
    reasonKey: matches.length > 0 ? 'marketplace:souk.antiCommodification.warning' : null,
  });
}

/** The no-resale condition is mandatory at creation (HRD P12 §3). */
export function hasNoResaleConsent(consentAt: string | null | undefined): boolean {
  return Boolean(consentAt);
}
