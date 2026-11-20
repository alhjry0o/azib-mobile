import type { ApplicationPayload } from '@/repositories/contracts/application';
import { seedAssistancePayloads } from '../../../../../mocks/seed/assistance';
import { GATE_FAILED_BAND_ID } from '../bands';
import { EMPTY_DEDUP_SIGNALS } from '../flags';
import { RULES_V1 } from '../rules.v1';
import { computeComponents, scoreApplication } from '../score-application';

const base = seedAssistancePayloads[0] as ApplicationPayload;
const NOW = new Date('2026-11-16T12:00:00.000Z');

function component(key: string, payload: ApplicationPayload) {
  const found = computeComponents(payload, RULES_V1).find((c) => c.key === key);
  if (!found) throw new Error(`missing component ${key}`);
  return found;
}

describe('computeComponents boundary table', () => {
  it('availableAssets: full points at zero, zero points at the threshold', () => {
    const zero = component('availableAssets', {
      ...base,
      assets: { ...base.assets, availableAssets: 0 },
    });
    const at = component('availableAssets', {
      ...base,
      assets: { ...base.assets, availableAssets: RULES_V1.gates.availableAssetsThreshold },
    });
    expect(zero.normalized).toBe(1);
    expect(zero.points).toBe(RULES_V1.weights.availableAssets);
    expect(at.normalized).toBe(0);
    expect(at.points).toBe(0);
  });

  it('availableAssets ignores restricted assets and unreceived inheritance', () => {
    const poor = component('availableAssets', {
      ...base,
      assets: {
        availableAssets: 0,
        restrictedAssets: 50_000_000,
        unreceivedInheritance: 50_000_000,
        savings: 0,
      },
    });
    expect(poor.points).toBe(RULES_V1.weights.availableAssets);
  });

  it('jobStability: zero when unemployed, full at the configured maximum', () => {
    const unemployed = component('jobStability', {
      ...base,
      income: { ...base.income, employmentStatus: 'unemployed', stabilityMonths: 999 },
    });
    const stable = component('jobStability', {
      ...base,
      income: {
        ...base.income,
        employmentStatus: 'employed',
        stabilityMonths: RULES_V1.thresholds.stabilityMonthsMax,
      },
    });
    expect(unemployed.points).toBe(0);
    expect(stable.points).toBe(RULES_V1.weights.jobStability);
  });

  it('incomeToNeeds: zero when income covers twice the needs, full when income is zero', () => {
    const required =
      base.obligations.monthlyRent +
      base.obligations.monthlyDebtPayments +
      base.obligations.monthlyEssentials;
    const covered = component('incomeToNeeds', {
      ...base,
      income: {
        ...base.income,
        monthlyIncome: required * RULES_V1.thresholds.needsCoverageRatioHigh,
      },
    });
    const nothing = component('incomeToNeeds', {
      ...base,
      income: { ...base.income, monthlyIncome: 0 },
    });
    expect(covered.points).toBe(0);
    expect(nothing.points).toBe(RULES_V1.weights.incomeToNeeds);
  });

  it('obligations: full at the configured ratio, zero when there are none', () => {
    const heavy = component('obligations', {
      ...base,
      income: { ...base.income, monthlyIncome: 10_000 },
      obligations: {
        ...base.obligations,
        monthlyRent: 10_000 * RULES_V1.thresholds.obligationsRatioHigh,
        monthlyDebtPayments: 0,
        monthlyEssentials: 0,
      },
    });
    const none = component('obligations', {
      ...base,
      obligations: {
        ...base.obligations,
        monthlyRent: 0,
        monthlyDebtPayments: 0,
        monthlyEssentials: 0,
      },
    });
    expect(heavy.points).toBe(RULES_V1.weights.obligations);
    expect(none.points).toBe(0);
  });

  it('seriousness: official engagement outranks family approval without proof', () => {
    const official = component('seriousness', {
      ...base,
      engagement: { ...base.engagement, engagementStatus: 'official_engagement' },
      documents: [],
    });
    const family = component('seriousness', {
      ...base,
      engagement: { ...base.engagement, engagementStatus: 'serious_family_approval' },
      documents: [],
    });
    expect(official.points).toBeGreaterThan(family.points);
  });

  it('every component stays inside 0..weight and exposes an explanation key', () => {
    for (const c of computeComponents(base, RULES_V1)) {
      expect(c.normalized).toBeGreaterThanOrEqual(0);
      expect(c.normalized).toBeLessThanOrEqual(1);
      expect(c.points).toBeGreaterThanOrEqual(0);
      expect(c.points).toBeLessThanOrEqual(c.weight);
      expect(c.explanationKey.startsWith('assistance:engine.explain.')).toBe(true);
    }
  });
});

describe('scoreApplication', () => {
  it('is advisory and carries the rule version', () => {
    const result = scoreApplication(
      { payload: base, requestedAmount: 150_000, priorAssistanceCount: 0, now: NOW },
      RULES_V1,
    );
    expect(result.advisory).toBe(true);
    expect(result.ruleVersion).toBe(RULES_V1.version);
    expect(result.evaluatedAt).toBe(NOW.toISOString());
  });

  it('never exceeds 100 and equals the sum of component points', () => {
    const result = scoreApplication(
      { payload: base, requestedAmount: 150_000, priorAssistanceCount: 0, now: NOW },
      RULES_V1,
    );
    const sum = result.breakdown.reduce((acc, c) => acc + c.points, 0);
    expect(result.totalScore).toBe(sum);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });

  it('produces no breakdown and no score when a gate fails', () => {
    const result = scoreApplication(
      {
        payload: { ...base, declarations: { ...base.declarations, truthful: false } },
        requestedAmount: 150_000,
        priorAssistanceCount: 0,
        now: NOW,
      },
      RULES_V1,
    );
    expect(result.gatePassed).toBe(false);
    expect(result.breakdown).toEqual([]);
    expect(result.totalScore).toBe(0);
    expect(result.bandId).toBe(GATE_FAILED_BAND_ID);
  });

  it('a wealthy-relative applicant is still scored, not blocked', () => {
    const result = scoreApplication(
      {
        payload: {
          ...base,
          assets: {
            availableAssets: 0,
            restrictedAssets: 80_000_000,
            unreceivedInheritance: 80_000_000,
            savings: 0,
          },
        },
        requestedAmount: 150_000,
        priorAssistanceCount: 0,
        now: NOW,
      },
      RULES_V1,
    );
    expect(result.gatePassed).toBe(true);
    expect(result.totalScore).toBeGreaterThan(0);
  });

  it('flags do not change the score', () => {
    const clean = scoreApplication(
      { payload: base, requestedAmount: 150_000, priorAssistanceCount: 0, now: NOW },
      RULES_V1,
    );
    const flagged = scoreApplication(
      {
        payload: base,
        requestedAmount: 150_000,
        priorAssistanceCount: 0,
        signals: { ...EMPTY_DEDUP_SIGNALS, identityDuplicate: true, documentReused: true },
        now: NOW,
      },
      RULES_V1,
    );
    expect(flagged.totalScore).toBe(clean.totalScore);
    expect(flagged.flags.length).toBeGreaterThan(clean.flags.length);
  });

  it('never emits a decision field', () => {
    const result = scoreApplication(
      { payload: base, requestedAmount: 150_000, priorAssistanceCount: 0, now: NOW },
      RULES_V1,
    );
    expect(Object.keys(result)).not.toContain('decision');
    expect(Object.keys(result)).not.toContain('approved');
  });
});
