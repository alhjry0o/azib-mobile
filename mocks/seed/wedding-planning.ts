// Standalone demo planning data (NOT part of SeedBundle) — mirrors the
// assistance.ts precedent so the existing seed test stays untouched.
// Everything here is fabricated demo content.
import type { CostItem, CostMember } from '@/features/weddings/engine/cost-sharing';

export const SEED_WEDDING_GROUP_ID = 'seed-wedding-group-1';

export const seedWeddingMembers: readonly CostMember[] = [
  { memberId: 'seed-user-1', weight: 1 },
  { memberId: 'seed-user-2', weight: 2 },
  { memberId: 'seed-user-3', weight: 3 },
];

export const seedWeddingItems: readonly CostItem[] = [
  { id: 'seed-item-hall', scope: 'shared', amount: 300000 },
  { id: 'seed-item-sound', scope: 'shared', amount: 120000 },
  { id: 'seed-item-clothing', scope: 'individual', amount: 40000, memberId: 'seed-user-1' },
  { id: 'seed-item-baraa', scope: 'shared', amount: 80000 },
];

export const seedWeddingPollOptions = [
  { id: 'opt-june', labelKey: 'weddings:demo.poll.june' },
  { id: 'opt-july', labelKey: 'weddings:demo.poll.july' },
] as const;

export const seedWeddingMessages: readonly { authorId: string; text: string }[] = [
  { authorId: 'seed-user-1', text: 'تم حجز القاعة مبدئياً، ننتظر تأكيد التصويت.' }, // i18n-allow-arabic
  { authorId: 'seed-user-2', text: 'أقترح إضافة بند للصوت والإضاءة في النسخة القادمة.' }, // i18n-allow-arabic
];
