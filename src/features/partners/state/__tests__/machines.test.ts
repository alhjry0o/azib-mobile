import {
  OFFER_STATUSES,
  OFFER_TRANSITIONS,
  PARTNER_STATUSES,
  PARTNER_TRANSITIONS,
  assertOfferTransition,
  assertPartnerTransition,
  canOfferTransition,
  canPartnerTransition,
  isClientWritableOfferStatus,
  isOfferTerminal,
  nextOfferStatuses,
  nextPartnerStatuses,
  toOfferWorkflowStatus,
  toPartnerWorkflowStatus,
} from '../index';

describe('partner machine', () => {
  it('declares exactly ten transitions and accepts all of them', () => {
    expect(PARTNER_TRANSITIONS.length).toBe(10);
    for (const t of PARTNER_TRANSITIONS) {
      expect(canPartnerTransition(t.from, t.to, t.actor)).toBe(true);
      expect(assertPartnerTransition(t.from, t.to, t.actor).ok).toBe(true);
    }
  });

  it('rejects every undeclared pair exhaustively', () => {
    let rejected = 0;
    for (const from of PARTNER_STATUSES) {
      for (const to of PARTNER_STATUSES) {
        if (PARTNER_TRANSITIONS.some((t) => t.from === from && t.to === to)) continue;
        rejected += 1;
        const result = assertPartnerTransition(from, to);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.meta.code).toBe('INVALID_TRANSITION');
      }
    }
    expect(rejected).toBeGreaterThan(0);
  });

  it('enforces the actor', () => {
    expect(canPartnerTransition('pending_verification', 'verified', 'partner_verifier')).toBe(true);
    expect(canPartnerTransition('pending_verification', 'verified', 'partner_owner')).toBe(false);
    expect(canPartnerTransition('verified', 'suspended', 'moderator')).toBe(true);
    expect(canPartnerTransition('suspended', 'verified', 'moderator')).toBe(false);
    expect(canPartnerTransition('suspended', 'verified', 'admin')).toBe(true);
  });

  it('keeps every legacy status inside the workflow vocabulary', () => {
    expect(toPartnerWorkflowStatus('draft')).toBe('draft');
    expect(toPartnerWorkflowStatus('verified')).toBe('verified');
    expect(toPartnerWorkflowStatus('suspended')).toBe('suspended');
  });

  it('leaves no partner status terminal (all are recoverable)', () => {
    for (const status of PARTNER_STATUSES) {
      expect(nextPartnerStatuses(status).length).toBeGreaterThan(0);
    }
  });
});

describe('offer machine', () => {
  it('declares exactly eight transitions and accepts all of them', () => {
    expect(OFFER_TRANSITIONS.length).toBe(8);
    for (const t of OFFER_TRANSITIONS) {
      expect(canOfferTransition(t.from, t.to, t.actor)).toBe(true);
      expect(assertOfferTransition(t.from, t.to, t.actor).ok).toBe(true);
    }
  });

  it('rejects every undeclared pair exhaustively', () => {
    let rejected = 0;
    for (const from of OFFER_STATUSES) {
      for (const to of OFFER_STATUSES) {
        if (OFFER_TRANSITIONS.some((t) => t.from === from && t.to === to)) continue;
        rejected += 1;
        expect(assertOfferTransition(from, to).ok).toBe(false);
      }
    }
    expect(rejected).toBeGreaterThan(0);
  });

  it('never lets the client write expired', () => {
    expect(isClientWritableOfferStatus('expired')).toBe(false);
    expect(isClientWritableOfferStatus('cancelled')).toBe(true);
    expect(canOfferTransition('active', 'expired', 'partner_owner')).toBe(false);
    expect(canOfferTransition('active', 'expired', 'system')).toBe(true);
  });

  it('requires review before publishing', () => {
    expect(canOfferTransition('draft', 'active')).toBe(false);
    expect(canOfferTransition('approved', 'active', 'reviewer')).toBe(true);
    expect(nextOfferStatuses('draft', 'partner_owner')).toEqual(['in_review']);
  });

  it('treats cancelled as terminal and maps legacy statuses', () => {
    expect(isOfferTerminal('cancelled')).toBe(true);
    expect(nextOfferStatuses('cancelled')).toEqual([]);
    expect(toOfferWorkflowStatus('active')).toBe('active');
    expect(toOfferWorkflowStatus('expired')).toBe('expired');
  });
});
