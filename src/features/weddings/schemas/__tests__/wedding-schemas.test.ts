import { CreateGroupSchema, JoinRequestSchema } from '../group';
import { BudgetItemSchema, CreatePollSchema } from '../planning';
import { ChatMessageSchema } from '../chat';

const group = {
  title: 'Demo group',
  governorateId: 'sanaa',
  districtId: null,
  city: null,
  scheduledDate: '2026-06-15T16:00:00.000Z',
  alternateDate: null,
  targetCount: 6,
  description: null,
  withdrawalConsent: true,
};

describe('wedding feature schemas', () => {
  it('requires at least two participants and withdrawal consent', () => {
    expect(CreateGroupSchema.safeParse(group).success).toBe(true);
    expect(CreateGroupSchema.safeParse({ ...group, targetCount: 1 }).success).toBe(false);
    expect(CreateGroupSchema.safeParse({ ...group, withdrawalConsent: false }).success).toBe(false);
  });

  it('requires display-name consent to join', () => {
    expect(
      JoinRequestSchema.safeParse({ message: 'hello', displayNameConsent: true }).success,
    ).toBe(true);
    expect(
      JoinRequestSchema.safeParse({ message: 'hello', displayNameConsent: false }).success,
    ).toBe(false);
  });

  it('requires two poll options and a bounded quorum', () => {
    const poll = {
      questionKey: 'q',
      kind: 'date' as const,
      options: [
        { id: 'o1', labelKey: 'l1' },
        { id: 'o2', labelKey: 'l2' },
      ],
      deadline: '2026-05-01T00:00:00.000Z',
      quorumPercent: 51,
      tieBreak: 'organizer_vote' as const,
    };
    expect(CreatePollSchema.safeParse(poll).success).toBe(true);
    expect(CreatePollSchema.safeParse({ ...poll, options: [] }).success).toBe(false);
    expect(CreatePollSchema.safeParse({ ...poll, quorumPercent: 0 }).success).toBe(false);
  });

  it('rejects fractional budget amounts', () => {
    const item = {
      category: 'hall' as const,
      labelKey: 'l',
      amount: 1000,
      scope: 'shared' as const,
      memberId: null,
      offerId: null,
    };
    expect(BudgetItemSchema.safeParse(item).success).toBe(true);
    expect(BudgetItemSchema.safeParse({ ...item, amount: 10.5 }).success).toBe(false);
  });

  it('bounds chat text length', () => {
    expect(ChatMessageSchema.safeParse({ text: 'ok' }).success).toBe(true);
    expect(ChatMessageSchema.safeParse({ text: '' }).success).toBe(false);
    expect(ChatMessageSchema.safeParse({ text: 'x'.repeat(501) }).success).toBe(false);
  });
});
