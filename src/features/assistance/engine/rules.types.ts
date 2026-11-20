// Eligibility rule contract. Every threshold and band lives in a rules file —
// never hardcoded in the engine, the UI, or the tests.
import type { Result } from '@/core/result';

export interface EligibilityWeights {
  readonly needSeverity: number;
  readonly incomeToNeeds: number;
  readonly obligations: number;
  readonly availableAssets: number;
  readonly seriousness: number;
  readonly jobStability: number;
}

export interface EligibilityGates {
  readonly requireRealIncomeSource: boolean;
  /** Available assets at or above this value fail the "not wealthy" gate. */
  readonly availableAssetsThreshold: number;
  readonly allowPriorAssistanceException: boolean;
  readonly requireTruthDeclaration: boolean;
}

export interface EligibilityBand {
  readonly id: string;
  readonly labelKey: string;
  readonly recommendationKey: string;
  readonly min: number;
  readonly max: number;
}

export interface EligibilityThresholds {
  readonly incomePerPersonHigh: number;
  readonly needsCoverageRatioHigh: number;
  readonly obligationsRatioHigh: number;
  readonly householdSizeMax: number;
  readonly stabilityMonthsMax: number;
  readonly rapidResubmissionWindowDays: number;
  readonly rapidResubmissionMax: number;
  readonly obligationsIncomeMismatchRatio: number;
}

export interface DocumentLimits {
  readonly imageMaxBytes: number;
  readonly pdfMaxBytes: number;
  readonly allowedMimeTypes: readonly string[];
}

export interface EligibilityRules {
  readonly version: string;
  /** Human approval is still pending for the provisional values below. */
  readonly policyStatus: 'pending-human-approval';
  readonly currency: 'YER';
  readonly weights: EligibilityWeights;
  readonly gates: EligibilityGates;
  readonly bands: readonly EligibilityBand[];
  readonly thresholds: EligibilityThresholds;
  readonly documentLimits: DocumentLimits;
  readonly appealWindowDays: number;
  /** Provisional policy: the applicant never sees the numeric breakdown. */
  readonly scoreVisibility: 'hidden';
}

export interface RulesSource {
  readonly id: string;
  load(): Promise<Result<EligibilityRules>>;
}
