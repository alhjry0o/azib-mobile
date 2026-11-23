import { CHAT_MAX_LENGTH, filterChatMessage } from '../message-filter';
import { DEFAULT_CHAT_RATE, checkChatRate } from '../rate-limit';
import { CHAT_RETENTION_DAYS, filterRetained, isExpired, retentionCutoff } from '../retention';
import { canModerate, canReport, canSendMessage } from '../moderation';

describe('chat message filter', () => {
  it('allows plain organizational text and budget figures', () => {
    expect(filterChatMessage('نقترح تقديم موعد الحجز أسبوعاً.').allowed).toBe(true); // i18n-allow-arabic
    expect(filterChatMessage('Cost is 100000 for the hall').allowed).toBe(true);
  });

  it('blocks Yemeni and international phone numbers', () => {
    for (const text of ['call 771234567', '+967771234567', '00967 771234567', '0771234567']) {
      const result = filterChatMessage(text);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('phone');
      expect(result.reasonKey).toBe('weddings:chat.blocked.phone');
    }
  });

  it('blocks links', () => {
    for (const text of ['https://example.com', 'www.example.com', 'visit example.com']) {
      const result = filterChatMessage(text);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('link');
    }
  });

  it('blocks image payloads and attachments', () => {
    for (const text of ['data:image/png;base64,AAA', 'photo.jpg', '![x](y)']) {
      const result = filterChatMessage(text);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('image');
    }
  });

  it('blocks empty and overlong messages', () => {
    expect(filterChatMessage('   ').reason).toBe('empty');
    expect(filterChatMessage('x'.repeat(CHAT_MAX_LENGTH + 1)).reason).toBe('tooLong');
  });
});

describe('chat rate limit', () => {
  it('allows up to the configured maximum inside the window', () => {
    const now = 100_000;
    const stamps = [91_000, 92_000, 93_000, 94_000];
    expect(checkChatRate(stamps, now).allowed).toBe(true);
    expect(checkChatRate([...stamps, 95_000], now).allowed).toBe(false);
  });

  it('ignores timestamps outside the window', () => {
    const now = 100_000;
    const old = [1_000, 2_000, 3_000, 4_000, 5_000];
    expect(checkChatRate(old, now).allowed).toBe(true);
  });

  it('reports a positive retry delay', () => {
    const result = checkChatRate([91_000, 92_000, 93_000, 94_000, 95_000], 100_000);
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(DEFAULT_CHAT_RATE.maxMessages).toBe(5);
  });
});

describe('chat retention', () => {
  const now = new Date('2026-06-01T00:00:00.000Z');

  it('drops messages older than the retention window', () => {
    const messages = [
      { id: 'old', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'new', createdAt: '2026-05-25T00:00:00.000Z' },
    ];
    expect(filterRetained(messages, now).map((m) => m.id)).toEqual(['new']);
    expect(isExpired('2026-01-01T00:00:00.000Z', now)).toBe(true);
    expect(isExpired('not-a-date', now)).toBe(true);
  });

  it('produces an ISO cutoff and uses the provisional 30 days', () => {
    expect(CHAT_RETENTION_DAYS).toBe(30);
    expect(new Date(retentionCutoff(now)).toISOString()).toBe(retentionCutoff(now));
  });
});

describe('chat moderation', () => {
  const now = new Date('2026-06-01T00:00:00.000Z');

  it('only active members may send', () => {
    expect(
      canSendMessage({ role: 'member', isActiveMember: true, mutedUntil: undefined, now }).allowed,
    ).toBe(true);
    expect(
      canSendMessage({ role: null, isActiveMember: false, now }).allowed,
    ).toBe(false);
  });

  it('honours mutes and their expiry', () => {
    expect(
      canSendMessage({ role: 'member', isActiveMember: true, mutedUntil: null, now }).allowed,
    ).toBe(false);
    expect(
      canSendMessage({
        role: 'member',
        isActiveMember: true,
        mutedUntil: '2026-07-01T00:00:00.000Z',
        now,
      }).allowed,
    ).toBe(false);
    expect(
      canSendMessage({
        role: 'member',
        isActiveMember: true,
        mutedUntil: '2026-05-01T00:00:00.000Z',
        now,
      }).allowed,
    ).toBe(true);
  });

  it('restricts moderation to the organizer', () => {
    expect(canModerate('organizer')).toBe(true);
    expect(canModerate('co_organizer')).toBe(false);
    expect(canModerate('member')).toBe(false);
    expect(canReport('member', true)).toBe(true);
    expect(canReport('member', false)).toBe(false);
  });
});
