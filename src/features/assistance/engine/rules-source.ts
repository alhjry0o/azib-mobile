// Swappable rules source (same pattern as HomeConfig, ADR-0023).
// A server-backed, versioned source replaces the mock in P18.
import type { Result } from '@/core/result';
import { RULES_V1 } from './rules.v1';
import type { EligibilityRules, RulesSource } from './rules.types';

export function createStaticRulesSource(rules: EligibilityRules = RULES_V1): RulesSource {
  return Object.freeze({
    id: `static:${rules.version}`,
    async load(): Promise<Result<EligibilityRules>> {
      return { ok: true, value: rules };
    },
  });
}

let activeSource: RulesSource = createStaticRulesSource();

export function getRulesSource(): RulesSource {
  return activeSource;
}

export function setRulesSource(source: RulesSource): void {
  activeSource = source;
}

export function resetRulesSource(): void {
  activeSource = createStaticRulesSource();
}
