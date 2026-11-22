import type { DisbursementStatus } from '@/repositories/contracts/disbursement';
import {
  DISBURSEMENT_CERTAINTIES,
  disbursementCertaintyOf,
} from '../components/DisbursementStatusBadge';

const ALL_STATUSES: readonly DisbursementStatus[] = [
  'pending',
  'confirmed',
  'proposed',
  'approved',
  'paid_recorded',
  'confirmed_by_beneficiary',
  'disputed',
  'rejected',
];

describe('disbursement certainty mapping', () => {
  it('maps every repository status to a known certainty', () => {
    for (const status of ALL_STATUSES) {
      expect(DISBURSEMENT_CERTAINTIES).toContain(disbursementCertaintyOf(status));
    }
  });

  it('never treats a recorded payment as beneficiary-confirmed', () => {
    expect(disbursementCertaintyOf('paid_recorded')).toBe('paidRecorded');
    expect(disbursementCertaintyOf('confirmed')).toBe('paidRecorded');
    expect(disbursementCertaintyOf('confirmed_by_beneficiary')).toBe('beneficiaryConfirmed');
  });

  it('treats the legacy pending value as a proposal', () => {
    expect(disbursementCertaintyOf('pending')).toBe('proposed');
    expect(disbursementCertaintyOf('proposed')).toBe('proposed');
  });

  it('keeps dispute and rejection distinct', () => {
    expect(disbursementCertaintyOf('disputed')).toBe('disputed');
    expect(disbursementCertaintyOf('rejected')).toBe('rejected');
  });

  it('covers all six certainty levels', () => {
    expect(DISBURSEMENT_CERTAINTIES.length).toBe(6);
  });
});
