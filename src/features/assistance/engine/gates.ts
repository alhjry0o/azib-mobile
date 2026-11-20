// Pass/Fail gates evaluated BEFORE any scoring. A failed gate never produces
// a decision — the recommendation stays "human review required" (ADR-0006).
import type { ApplicationPayload, EvaluationGate } from '@/repositories/contracts/application';
import type { EligibilityRules } from './rules.types';

export interface GateInput {
  readonly payload: ApplicationPayload;
  readonly priorAssistanceCount: number;
}

export function evaluateGates(
  input: GateInput,
  rules: EligibilityRules,
): readonly EvaluationGate[] {
  const { payload } = input;
  const gates: EvaluationGate[] = [];

  const realIncome =
    !rules.gates.requireRealIncomeSource ||
    (payload.income.incomeSource !== 'none' && payload.income.monthlyIncome > 0);
  gates.push(
    Object.freeze({
      key: 'real_income_source',
      passed: realIncome,
      reasonKey: realIncome
        ? 'assistance:gates.realIncome.pass'
        : 'assistance:gates.realIncome.fail',
    }),
  );

  // ONLY availableAssets. Restricted assets, relatives' wealth and
  // unreceived inheritance are never part of this gate.
  const notWealthy = payload.assets.availableAssets < rules.gates.availableAssetsThreshold;
  gates.push(
    Object.freeze({
      key: 'not_wealthy',
      passed: notWealthy,
      reasonKey: notWealthy
        ? 'assistance:gates.notWealthy.pass'
        : 'assistance:gates.notWealthy.fail',
    }),
  );

  const noPrior =
    input.priorAssistanceCount === 0 || rules.gates.allowPriorAssistanceException;
  gates.push(
    Object.freeze({
      key: 'no_prior_assistance',
      passed: noPrior,
      reasonKey: noPrior
        ? 'assistance:gates.noPrior.pass'
        : 'assistance:gates.noPrior.fail',
    }),
  );

  const truthful =
    !rules.gates.requireTruthDeclaration || payload.declarations.truthful === true;
  gates.push(
    Object.freeze({
      key: 'truth_declaration',
      passed: truthful,
      reasonKey: truthful
        ? 'assistance:gates.truth.pass'
        : 'assistance:gates.truth.fail',
    }),
  );

  return Object.freeze(gates);
}

export function allGatesPassed(gates: readonly EvaluationGate[]): boolean {
  return gates.every((gate) => gate.passed);
}
