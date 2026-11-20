// Pure advisory engine. No React, no IO, no clock reads except the injected one.
// Relatives' wealth, restricted assets and unreceived inheritance are NEVER
// used in any component (HRD §3 + ADR-0006).
import type {
  AdvisoryEvaluation,
  ApplicationPayload,
  EvaluationComponent,
} from '@/repositories/contracts/application';
import {
  GATE_FAILED_BAND_ID,
  GATE_FAILED_LABEL_KEY,
  GATE_FAILED_RECOMMENDATION_KEY,
  resolveBand,
} from './bands';
import { EMPTY_DEDUP_SIGNALS, detectFlags, obligationsTotal, type DedupSignals } from './flags';
import { allGatesPassed, evaluateGates } from './gates';
import type { EligibilityRules } from './rules.types';

export interface ScoringInput {
  readonly payload: ApplicationPayload;
  readonly requestedAmount: number;
  readonly priorAssistanceCount: number;
  readonly signals?: DedupSignals;
  readonly now?: Date;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function incomePerPerson(payload: ApplicationPayload): number {
  return payload.income.monthlyIncome / Math.max(1, payload.applicant.householdSize);
}

/** Six normalized components. Exported so boundary tables can test each one. */
export function computeComponents(
  payload: ApplicationPayload,
  rules: EligibilityRules,
): readonly EvaluationComponent[] {
  const t = rules.thresholds;
  const w = rules.weights;
  const required = obligationsTotal(payload);
  const perPerson = incomePerPerson(payload);

  const dependentsPressure = clamp01(
    (payload.obligations.dependentsCount + 1) / t.householdSizeMax,
  );
  const incomePressure = 1 - clamp01(perPerson / t.incomePerPersonHigh);
  const needSeverity = 0.5 * dependentsPressure + 0.5 * incomePressure;

  const coverage = payload.income.monthlyIncome / Math.max(1, required);
  const incomeToNeeds = 1 - clamp01(coverage / t.needsCoverageRatioHigh);

  const obligationsRatio = required / Math.max(1, payload.income.monthlyIncome);
  const obligations = clamp01(obligationsRatio / t.obligationsRatioHigh);

  // Available assets ONLY.
  const availableAssets =
    1 - clamp01(payload.assets.availableAssets / rules.gates.availableAssetsThreshold);

  const hasProof = payload.documents.some((doc) => doc.kind === 'engagement_proof');
  const seriousnessBase =
    payload.engagement.engagementStatus === 'official_engagement' ? 1 : 0.6;
  const seriousness = clamp01(seriousnessBase + (hasProof ? 0.2 : 0));

  const jobStability =
    payload.income.employmentStatus === 'unemployed'
      ? 0
      : clamp01(payload.income.stabilityMonths / t.stabilityMonthsMax);

  const build = (
    key: string,
    weight: number,
    normalized: number,
  ): EvaluationComponent =>
    Object.freeze({
      key,
      weight,
      normalized,
      points: Math.round(weight * normalized),
      explanationKey: `assistance:engine.explain.${key}`,
    });

  return Object.freeze([
    build('needSeverity', w.needSeverity, needSeverity),
    build('incomeToNeeds', w.incomeToNeeds, incomeToNeeds),
    build('obligations', w.obligations, obligations),
    build('availableAssets', w.availableAssets, availableAssets),
    build('seriousness', w.seriousness, seriousness),
    build('jobStability', w.jobStability, jobStability),
  ]);
}

export function scoreApplication(
  input: ScoringInput,
  rules: EligibilityRules,
): AdvisoryEvaluation {
  const now = input.now ?? new Date();
  const signals = input.signals ?? EMPTY_DEDUP_SIGNALS;
  const gates = evaluateGates(
    { payload: input.payload, priorAssistanceCount: input.priorAssistanceCount },
    rules,
  );
  const gatePassed = allGatesPassed(gates);
  const flags = detectFlags({ payload: input.payload, signals }, rules);

  if (!gatePassed) {
    return Object.freeze({
      ruleVersion: rules.version,
      advisory: true as const,
      gatePassed: false,
      gates,
      breakdown: Object.freeze([]),
      totalScore: 0,
      bandId: GATE_FAILED_BAND_ID,
      bandLabelKey: GATE_FAILED_LABEL_KEY,
      recommendationKey: GATE_FAILED_RECOMMENDATION_KEY,
      flags,
      evaluatedAt: now.toISOString(),
    });
  }

  const breakdown = computeComponents(input.payload, rules);
  const sum = breakdown.reduce((acc, component) => acc + component.points, 0);
  const totalScore = Math.max(0, Math.min(100, Math.round(sum)));
  const band = resolveBand(totalScore, rules);

  return Object.freeze({
    ruleVersion: rules.version,
    advisory: true as const,
    gatePassed: true,
    gates,
    breakdown,
    totalScore,
    bandId: band.id,
    bandLabelKey: band.labelKey,
    recommendationKey: band.recommendationKey,
    flags,
    evaluatedAt: now.toISOString(),
  });
}
