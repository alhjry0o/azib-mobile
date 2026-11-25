import {
  ITEM_STATUSES,
  ITEM_TRANSITIONS,
  REQUEST_STATUSES,
  REQUEST_TRANSITIONS,
  assertItemTransition,
  assertRequestTransition,
  canItemTransition,
  canRequestTransition,
  isActiveRequestStatus,
  isClientWritableItemStatus,
  isItemTerminal,
  isRequestTerminal,
  nextItemStatuses,
  nextRequestStatuses,
  toItemWorkflowStatus,
  toRequestWorkflowStatus,
} from '../index';

describe('souk item machine', () => {
  it('declares exactly ten transitions and accepts all of them', () => {
    expect(ITEM_TRANSITIONS.length).toBe(10);
    for (const t of ITEM_TRANSITIONS) {
      expect(canItemTransition(t.from, t.to, t.actor)).toBe(true);
      expect(assertItemTransition(t.from, t.to, t.actor).ok).toBe(true);
    }
  });

  it('rejects every undeclared pair exhaustively', () => {
    let rejected = 0;
    for (const from of ITEM_STATUSES) {
      for (const to of ITEM_STATUSES) {
        if (ITEM_TRANSITIONS.some((t) => t.from === from && t.to === to)) continue;
        rejected += 1;
        const result = assertItemTransition(from, to);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.meta.code).toBe('INVALID_TRANSITION');
      }
    }
    expect(rejected).toBeGreaterThan(0);
  });

  it('enforces the actor', () => {
    expect(canItemTransition('draft', 'available', 'donor')).toBe(true);
    expect(canItemTransition('pending_review', 'available', 'donor')).toBe(false);
    expect(canItemTransition('pending_review', 'available', 'moderator')).toBe(true);
    expect(canItemTransition('available', 'reserved', 'donor')).toBe(false);
    expect(canItemTransition('available', 'reserved', 'system')).toBe(true);
  });

  it('never lets the client write reserved / handed_over / expired', () => {
    expect(isClientWritableItemStatus('reserved')).toBe(false);
    expect(isClientWritableItemStatus('handed_over')).toBe(false);
    expect(isClientWritableItemStatus('expired')).toBe(false);
    expect(isClientWritableItemStatus('available')).toBe(true);
  });

  it('maps the legacy claimed alias and keeps terminal statuses closed', () => {
    expect(toItemWorkflowStatus('claimed')).toBe('handed_over');
    expect(toItemWorkflowStatus('available')).toBe('available');
    expect(toItemWorkflowStatus('reserved')).toBe('reserved');
    for (const status of ['handed_over', 'withdrawn', 'rejected'] as const) {
      expect(isItemTerminal(status)).toBe(true);
      expect(nextItemStatuses(status)).toEqual([]);
    }
  });

  it('allows relisting an expired item back to draft', () => {
    expect(nextItemStatuses('expired', 'donor')).toEqual(['draft']);
  });
});

describe('souk request machine', () => {
  it('declares exactly nine transitions and accepts all of them', () => {
    expect(REQUEST_TRANSITIONS.length).toBe(9);
    for (const t of REQUEST_TRANSITIONS) {
      expect(canRequestTransition(t.from, t.to, t.actor)).toBe(true);
      expect(assertRequestTransition(t.from, t.to, t.actor).ok).toBe(true);
    }
  });

  it('rejects every undeclared pair exhaustively', () => {
    let rejected = 0;
    for (const from of REQUEST_STATUSES) {
      for (const to of REQUEST_STATUSES) {
        if (REQUEST_TRANSITIONS.some((t) => t.from === from && t.to === to)) continue;
        rejected += 1;
        expect(assertRequestTransition(from, to).ok).toBe(false);
      }
    }
    expect(rejected).toBeGreaterThan(0);
  });

  it('only the system writes handed_over', () => {
    expect(canRequestTransition('accepted', 'handed_over', 'system')).toBe(true);
    expect(canRequestTransition('accepted', 'handed_over', 'donor')).toBe(false);
    expect(canRequestTransition('accepted', 'handed_over', 'requester')).toBe(false);
  });

  it('deduplicates outgoing statuses and marks active ones', () => {
    expect(nextRequestStatuses('pending', 'donor')).toEqual(['accepted', 'rejected']);
    expect(isActiveRequestStatus('pending')).toBe(true);
    expect(isActiveRequestStatus('accepted')).toBe(true);
    expect(isActiveRequestStatus('handed_over')).toBe(false);
    expect(toRequestWorkflowStatus('accepted')).toBe('accepted');
  });

  it('keeps terminal statuses closed', () => {
    for (const status of ['rejected', 'cancelled', 'handed_over'] as const) {
      expect(isRequestTerminal(status)).toBe(true);
      expect(nextRequestStatuses(status)).toEqual([]);
    }
  });
});
