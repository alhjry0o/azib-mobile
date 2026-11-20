import type { ApplicationPayload } from '@/repositories/contracts/application';
import { seedAssistancePayloads } from '../../../../../mocks/seed/assistance';
import { EMPTY_DEDUP_SIGNALS, detectFlags, obligationsTotal } from '../flags';
import { RULES_V1 } from '../rules.v1';

const base = seedAssistancePayloads[0] as ApplicationPayload;

describe('detectFlags', () => {
  it('returns no flags for a clean application', () => {
    expect(detectFlags({ payload: base, signals: EMPTY_DEDUP_SIGNALS }, RULES_V1)).toEqual([]);
  });

  it('surfaces each duplication signal', () => {
    const keys = detectFlags(
      {
        payload: base,
        signals: {
          identityDuplicate: true,
          phoneDuplicate: true,
          documentReused: true,
          recentSubmissionCount: 0,
        },
      },
      RULES_V1,
    ).map((flag) => flag.key);
    expect(keys).toContain('identityDuplicate');
    expect(keys).toContain('phoneDuplicate');
    expect(keys).toContain('documentReused');
  });

  it('flags rapid resubmission at the configured maximum', () => {
    const at = detectFlags(
      {
        payload: base,
        signals: {
          ...EMPTY_DEDUP_SIGNALS,
          recentSubmissionCount: RULES_V1.thresholds.rapidResubmissionMax,
        },
      },
      RULES_V1,
    );
    expect(at.map((f) => f.key)).toContain('rapidResubmission');
    const below = detectFlags(
      {
        payload: base,
        signals: {
          ...EMPTY_DEDUP_SIGNALS,
          recentSubmissionCount: RULES_V1.thresholds.rapidResubmissionMax - 1,
        },
      },
      RULES_V1,
    );
    expect(below.map((f) => f.key)).not.toContain('rapidResubmission');
  });

  it('flags income/obligation inconsistency beyond the ratio', () => {
    const income = 10_000;
    const ratio = RULES_V1.thresholds.obligationsIncomeMismatchRatio;
    const payload: ApplicationPayload = {
      ...base,
      income: { ...base.income, monthlyIncome: income },
      obligations: {
        ...base.obligations,
        monthlyRent: income * ratio + 1,
        monthlyDebtPayments: 0,
        monthlyEssentials: 0,
      },
    };
    expect(detectFlags({ payload, signals: EMPTY_DEDUP_SIGNALS }, RULES_V1).map((f) => f.key)).toContain(
      'incomeObligationMismatch',
    );
  });

  it('never flags when income is zero (no ratio to compare)', () => {
    const payload: ApplicationPayload = {
      ...base,
      income: { ...base.income, monthlyIncome: 0 },
    };
    expect(detectFlags({ payload, signals: EMPTY_DEDUP_SIGNALS }, RULES_V1)).toEqual([]);
  });

  it('every flag label is an i18n key', () => {
    const flags = detectFlags(
      { payload: base, signals: { ...EMPTY_DEDUP_SIGNALS, identityDuplicate: true } },
      RULES_V1,
    );
    for (const flag of flags) expect(flag.labelKey.startsWith('assistance:flags.')).toBe(true);
  });
});

describe('obligationsTotal', () => {
  it('sums rent, debt and essentials only', () => {
    expect(obligationsTotal(base)).toBe(
      base.obligations.monthlyRent +
        base.obligations.monthlyDebtPayments +
        base.obligations.monthlyEssentials,
    );
  });
});
