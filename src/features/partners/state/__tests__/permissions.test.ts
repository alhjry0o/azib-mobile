import {
  AMBASSADOR_FORBIDDEN,
  can,
  canEditOwnOffer,
  canEditOwnPartner,
  isForbiddenForAmbassador,
} from '../index';

describe('ambassador is a field role only', () => {
  it('denies every forbidden permission explicitly', () => {
    for (const permission of AMBASSADOR_FORBIDDEN) {
      expect(can('ambassador', permission)).toBe(false);
      expect(isForbiddenForAmbassador(permission)).toBe(true);
    }
  });

  it('never reaches verification documents, beneficiary data or applications', () => {
    expect(can('ambassador', 'view_verification_documents')).toBe(false);
    expect(can('ambassador', 'view_beneficiary_data')).toBe(false);
    expect(can('ambassador', 'view_ambassador_applications')).toBe(false);
  });

  it('allows field work and public browsing', () => {
    expect(can('ambassador', 'view_assigned_tasks')).toBe(true);
    expect(can('ambassador', 'submit_task')).toBe(true);
    expect(can('ambassador', 'nominate_partner')).toBe(true);
    expect(can('ambassador', 'browse_partners')).toBe(true);
    expect(can('ambassador', 'report_offer')).toBe(true);
  });

  it('cannot act as a partner owner', () => {
    expect(can('ambassador', 'submit_offer')).toBe(false);
    expect(canEditOwnPartner('ambassador', true)).toBe(false);
    expect(canEditOwnOffer('ambassador', true)).toBe(false);
  });
});

describe('other roles', () => {
  it('guests only browse', () => {
    expect(can('guest', 'browse_partners')).toBe(true);
    expect(can('guest', 'save_offer')).toBe(false);
    expect(can('guest', 'register_partner')).toBe(false);
  });

  it('owners manage their own resources only with ownership', () => {
    expect(can('partner_owner', 'submit_offer')).toBe(true);
    expect(canEditOwnOffer('partner_owner', true)).toBe(true);
    expect(canEditOwnOffer('partner_owner', false)).toBe(false);
    expect(can('partner_owner', 'decide_verification')).toBe(false);
  });

  it('verifier decides verification and sees documents', () => {
    expect(can('partner_verifier', 'decide_verification')).toBe(true);
    expect(can('partner_verifier', 'view_verification_documents')).toBe(true);
    expect(can('partner_verifier', 'publish_offer')).toBe(false);
  });

  it('reviewer publishes but cannot suspend', () => {
    expect(can('reviewer', 'publish_offer')).toBe(true);
    expect(can('reviewer', 'suspend_partner')).toBe(false);
    expect(can('moderator', 'suspend_partner')).toBe(true);
  });

  it('no role except admin reaches beneficiary data', () => {
    for (const role of [
      'guest',
      'member',
      'partner_owner',
      'ambassador',
      'reviewer',
      'partner_verifier',
      'moderator',
      'auditor',
    ] as const) {
      expect(can(role, 'view_beneficiary_data')).toBe(false);
    }
  });
});
