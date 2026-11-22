import {
  DISBURSEMENT_STATUSES,
  DISBURSEMENT_TRANSITIONS,
  assertDisbursementTransition,
  canDisbursementTransition,
  isDisbursementTerminal,
  nextDisbursementStatuses,
  toDisbursementWorkflowStatus,
} from '../disbursement-machine';

describe('disbursement machine', () => {
  it('accepts every declared transition', () => {
    for (const t of DISBURSEMENT_TRANSITIONS) {
      expect(canDisbursementTransition(t.from, t.to, t.actor)).toBe(true);
      expect(assertDisbursementTransition(t.from, t.to, t.actor).ok).toBe(true);
    }
  });

  it('rejects every undeclared pair', () => {
    let rejected = 0;
    for (const from of DISBURSEMENT_STATUSES) {
      for (const to of DISBURSEMENT_STATUSES) {
        if (DISBURSEMENT_TRANSITIONS.some((t) => t.from === from && t.to === to)) continue;
        rejected += 1;
        expect(assertDisbursementTransition(from, to).ok).toBe(false);
      }
    }
    expect(rejected).toBeGreaterThan(0);
  });

  it('only a checker approves, only the beneficiary confirms', () => {
    expect(canDisbursementTransition('proposed', 'approved', 'checker')).toBe(true);
    expect(canDisbursementTransition('proposed', 'approved', 'maker')).toBe(false);
    expect(
      canDisbursementTransition('paid_recorded', 'confirmed_by_beneficiary', 'beneficiary'),
    ).toBe(true);
    expect(
      canDisbursementTransition('paid_recorded', 'confirmed_by_beneficiary', 'finance_officer'),
    ).toBe(false);
  });

  it('never pays before approval', () => {
    expect(canDisbursementTransition('proposed', 'paid_recorded')).toBe(false);
  });

  it('a dispute can only be re-recorded by finance', () => {
    expect(canDisbursementTransition('disputed', 'paid_recorded', 'finance_officer')).toBe(true);
    expect(canDisbursementTransition('disputed', 'approved')).toBe(false);
  });

  it('terminal statuses and legacy mapping', () => {
    expect(isDisbursementTerminal('confirmed_by_beneficiary')).toBe(true);
    expect(isDisbursementTerminal('rejected')).toBe(true);
    expect(nextDisbursementStatuses('rejected')).toEqual([]);
    expect(toDisbursementWorkflowStatus('pending')).toBe('proposed');
    expect(toDisbursementWorkflowStatus('confirmed')).toBe('paid_recorded');
  });
});
