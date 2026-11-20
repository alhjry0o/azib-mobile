// Fraud / duplication signals. These NEVER change the score — they are
// reviewer signals only, and every label is an i18n key.
import type { ApplicationPayload, EvaluationFlag } from '@/repositories/contracts/application';
import type { EligibilityRules } from './rules.types';

export interface DedupSignals {
  readonly identityDuplicate: boolean;
  readonly phoneDuplicate: boolean;
  readonly documentReused: boolean;
  /** Submissions by the same applicant inside the configured window. */
  readonly recentSubmissionCount: number;
}

export const EMPTY_DEDUP_SIGNALS: DedupSignals = Object.freeze({
  identityDuplicate: false,
  phoneDuplicate: false,
  documentReused: false,
  recentSubmissionCount: 0,
});

export interface FlagInput {
  readonly payload: ApplicationPayload;
  readonly signals: DedupSignals;
}

export function obligationsTotal(payload: ApplicationPayload): number {
  const o = payload.obligations;
  return o.monthlyRent + o.monthlyDebtPayments + o.monthlyEssentials;
}

export function detectFlags(
  input: FlagInput,
  rules: EligibilityRules,
): readonly EvaluationFlag[] {
  const flags: EvaluationFlag[] = [];
  const push = (key: string): void => {
    flags.push(Object.freeze({ key, labelKey: `assistance:flags.${key}` }));
  };

  if (input.signals.identityDuplicate) push('identityDuplicate');
  if (input.signals.phoneDuplicate) push('phoneDuplicate');
  if (input.signals.documentReused) push('documentReused');
  if (input.signals.recentSubmissionCount >= rules.thresholds.rapidResubmissionMax) {
    push('rapidResubmission');
  }

  const income = input.payload.income.monthlyIncome;
  const obligations = obligationsTotal(input.payload);
  if (
    income > 0 &&
    obligations > income * rules.thresholds.obligationsIncomeMismatchRatio
  ) {
    push('incomeObligationMismatch');
  }

  return Object.freeze(flags);
}
