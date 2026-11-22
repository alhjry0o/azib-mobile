import {
  DONATION_STATUSES,
  DONATION_TRANSITIONS,
  assertClientDonationWrite,
  assertDonationTransition,
  canDonationTransition,
  isDonationTerminal,
  nextDonationStatuses,
  toDonationWorkflowStatus,
} from '../donation-machine';

describe('donation machine', () => {
  it('accepts every declared transition', () => {
    for (const t of DONATION_TRANSITIONS) {
      expect(canDonationTransition(t.from, t.to, t.actor)).toBe(true);
      expect(assertDonationTransition(t.from, t.to, t.actor).ok).toBe(true);
    }
  });

  it('rejects every pair that is not declared', () => {
    let rejected = 0;
    for (const from of DONATION_STATUSES) {
      for (const to of DONATION_STATUSES) {
        if (DONATION_TRANSITIONS.some((t) => t.from === from && t.to === to)) continue;
        rejected += 1;
        const result = assertDonationTransition(from, to);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.meta.code).toBe('INVALID_TRANSITION');
      }
    }
    expect(rejected).toBeGreaterThan(0);
  });

  it('enforces the actor', () => {
    expect(canDonationTransition('provider_confirmed', 'verified', 'finance_officer')).toBe(true);
    expect(canDonationTransition('provider_confirmed', 'verified', 'donor')).toBe(false);
    expect(canDonationTransition('intent_created', 'provider_pending', 'donor')).toBe(false);
  });

  it('terminal statuses have no outgoing transitions', () => {
    for (const status of ['verified', 'declined', 'cancelled'] as const) {
      expect(isDonationTerminal(status)).toBe(true);
      expect(nextDonationStatuses(status)).toEqual([]);
    }
  });

  it('maps legacy values without ever implying verification', () => {
    expect(toDonationWorkflowStatus('pending')).toBe('provider_pending');
    expect(toDonationWorkflowStatus('confirmed')).toBe('provider_confirmed');
    expect(toDonationWorkflowStatus('declined')).toBe('declined');
    expect(toDonationWorkflowStatus('verified')).toBe('verified');
  });

  it('client may only cancel an intent', () => {
    expect(assertClientDonationWrite('intent_created', 'cancelled').ok).toBe(true);
    expect(assertClientDonationWrite('intent_created', 'verified').ok).toBe(false);
    expect(assertClientDonationWrite('provider_pending', 'cancelled').ok).toBe(false);
    expect(assertClientDonationWrite('provider_confirmed', 'verified').ok).toBe(false);
    expect(assertClientDonationWrite('verified', 'cancelled').ok).toBe(false);
  });

  it('client write refusal is Forbidden, not a silent no-op', () => {
    const result = assertClientDonationWrite('provider_confirmed', 'verified');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('Forbidden');
  });
});
