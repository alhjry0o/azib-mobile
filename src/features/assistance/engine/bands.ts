// Band resolution reads exclusively from the versioned rules.
import type { EligibilityBand, EligibilityRules } from './rules.types';

export const GATE_FAILED_BAND_ID = 'gates_failed';
export const GATE_FAILED_LABEL_KEY = 'assistance:bands.gatesFailed';
export const GATE_FAILED_RECOMMENDATION_KEY = 'assistance:recommendations.humanReview';

export function resolveBand(score: number, rules: EligibilityRules): EligibilityBand {
  const rounded = Math.round(score);
  const found = rules.bands.find((band) => rounded >= band.min && rounded <= band.max);
  const fallback = rules.bands[rules.bands.length - 1];
  return found ?? fallback ?? Object.freeze({
    id: GATE_FAILED_BAND_ID,
    labelKey: GATE_FAILED_LABEL_KEY,
    recommendationKey: GATE_FAILED_RECOMMENDATION_KEY,
    min: 0,
    max: 0,
  });
}
