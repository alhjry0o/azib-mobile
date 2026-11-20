export type {
  DocumentLimits,
  EligibilityBand,
  EligibilityGates,
  EligibilityRules,
  EligibilityThresholds,
  EligibilityWeights,
  RulesSource,
} from './rules.types';
export { RULES_V1, TOTAL_WEIGHT } from './rules.v1';
export {
  createStaticRulesSource,
  getRulesSource,
  resetRulesSource,
  setRulesSource,
} from './rules-source';
export type { GateInput } from './gates';
export { allGatesPassed, evaluateGates } from './gates';
export type { DedupSignals, FlagInput } from './flags';
export { EMPTY_DEDUP_SIGNALS, detectFlags, obligationsTotal } from './flags';
export {
  GATE_FAILED_BAND_ID,
  GATE_FAILED_LABEL_KEY,
  GATE_FAILED_RECOMMENDATION_KEY,
  resolveBand,
} from './bands';
export type { ScoringInput } from './score-application';
export { computeComponents, scoreApplication } from './score-application';
