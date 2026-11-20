// PENDING_POLICY — provisional values approved by the owner for P08 use.
// Final approval is still pending (docs/PRODUCT_POLICIES.md).
// This is the ONLY place thresholds and bands are defined.
import type { EligibilityRules } from './rules.types';

export const RULES_V1: EligibilityRules = Object.freeze({
  version: 'eligibility-v1',
  policyStatus: 'pending-human-approval',
  currency: 'YER',
  weights: Object.freeze({
    needSeverity: 30,
    incomeToNeeds: 20,
    obligations: 15,
    availableAssets: 15,
    seriousness: 10,
    jobStability: 10,
  }),
  gates: Object.freeze({
    requireRealIncomeSource: true,
    availableAssetsThreshold: 500_000,
    allowPriorAssistanceException: false,
    requireTruthDeclaration: true,
  }),
  bands: Object.freeze([
    Object.freeze({
      id: 'not_eligible',
      labelKey: 'assistance:bands.notEligible',
      recommendationKey: 'assistance:recommendations.notEligible',
      min: 0,
      max: 30,
    }),
    Object.freeze({
      id: 'additional_review',
      labelKey: 'assistance:bands.additionalReview',
      recommendationKey: 'assistance:recommendations.additionalReview',
      min: 31,
      max: 55,
    }),
    Object.freeze({
      id: 'partial',
      labelKey: 'assistance:bands.partial',
      recommendationKey: 'assistance:recommendations.partial',
      min: 56,
      max: 75,
    }),
    Object.freeze({
      id: 'full',
      labelKey: 'assistance:bands.full',
      recommendationKey: 'assistance:recommendations.full',
      min: 76,
      max: 100,
    }),
  ]),
  thresholds: Object.freeze({
    incomePerPersonHigh: 150_000,
    needsCoverageRatioHigh: 2,
    obligationsRatioHigh: 1.5,
    householdSizeMax: 12,
    stabilityMonthsMax: 36,
    rapidResubmissionWindowDays: 30,
    rapidResubmissionMax: 2,
    obligationsIncomeMismatchRatio: 3,
  }),
  documentLimits: Object.freeze({
    imageMaxBytes: 5 * 1024 * 1024,
    pdfMaxBytes: 10 * 1024 * 1024,
    allowedMimeTypes: Object.freeze(['image/jpeg', 'image/png', 'application/pdf']),
  }),
  appealWindowDays: 14,
  scoreVisibility: 'hidden',
});

export const TOTAL_WEIGHT =
  RULES_V1.weights.needSeverity +
  RULES_V1.weights.incomeToNeeds +
  RULES_V1.weights.obligations +
  RULES_V1.weights.availableAssets +
  RULES_V1.weights.seriousness +
  RULES_V1.weights.jobStability;
