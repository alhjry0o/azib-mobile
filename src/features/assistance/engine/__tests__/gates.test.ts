import type { ApplicationPayload } from '@/repositories/contracts/application';
import { seedAssistancePayloads } from '../../../../../mocks/seed/assistance';
import { RULES_V1 } from '../rules.v1';
import { allGatesPassed, evaluateGates } from '../gates';

const base = seedAssistancePayloads[0] as ApplicationPayload;

function withPatch(patch: Partial<ApplicationPayload>): ApplicationPayload {
  return { ...base, ...patch };
}

describe('eligibility gates', () => {
  it('passes for a complete honest application', () => {
    const gates = evaluateGates({ payload: base, priorAssistanceCount: 0 }, RULES_V1);
    expect(allGatesPassed(gates)).toBe(true);
    expect(gates.length).toBe(4);
  });

  it('fails when there is no real income source', () => {
    const payload = withPatch({
      income: { ...base.income, incomeSource: 'none', monthlyIncome: 0 },
    });
    const gates = evaluateGates({ payload, priorAssistanceCount: 0 }, RULES_V1);
    expect(gates.find((g) => g.key === 'real_income_source')?.passed).toBe(false);
    expect(allGatesPassed(gates)).toBe(false);
  });

  it('fails at the available-assets threshold and passes just below it', () => {
    const at = withPatch({
      assets: { ...base.assets, availableAssets: RULES_V1.gates.availableAssetsThreshold },
    });
    const below = withPatch({
      assets: { ...base.assets, availableAssets: RULES_V1.gates.availableAssetsThreshold - 1 },
    });
    expect(
      evaluateGates({ payload: at, priorAssistanceCount: 0 }, RULES_V1).find(
        (g) => g.key === 'not_wealthy',
      )?.passed,
    ).toBe(false);
    expect(
      evaluateGates({ payload: below, priorAssistanceCount: 0 }, RULES_V1).find(
        (g) => g.key === 'not_wealthy',
      )?.passed,
    ).toBe(true);
  });

  it('relatives wealth and unreceived inheritance never fail the gate', () => {
    const payload = withPatch({
      assets: {
        availableAssets: 0,
        restrictedAssets: 99_000_000,
        unreceivedInheritance: 99_000_000,
        savings: 0,
      },
    });
    const gates = evaluateGates({ payload, priorAssistanceCount: 0 }, RULES_V1);
    expect(allGatesPassed(gates)).toBe(true);
  });

  it('blocks prior assistance while the exception is closed', () => {
    const gates = evaluateGates({ payload: base, priorAssistanceCount: 1 }, RULES_V1);
    expect(gates.find((g) => g.key === 'no_prior_assistance')?.passed).toBe(false);
  });

  it('allows prior assistance only when the rule opens the exception', () => {
    const open = {
      ...RULES_V1,
      gates: { ...RULES_V1.gates, allowPriorAssistanceException: true },
    };
    const gates = evaluateGates({ payload: base, priorAssistanceCount: 3 }, open);
    expect(gates.find((g) => g.key === 'no_prior_assistance')?.passed).toBe(true);
  });

  it('requires the truth declaration', () => {
    const payload = withPatch({
      declarations: { ...base.declarations, truthful: false },
    });
    const gates = evaluateGates({ payload, priorAssistanceCount: 0 }, RULES_V1);
    expect(gates.find((g) => g.key === 'truth_declaration')?.passed).toBe(false);
  });

  it('reports every failing gate, not just the first', () => {
    const payload = withPatch({
      income: { ...base.income, incomeSource: 'none', monthlyIncome: 0 },
      declarations: { ...base.declarations, truthful: false },
    });
    const gates = evaluateGates({ payload, priorAssistanceCount: 2 }, RULES_V1);
    expect(gates.filter((g) => !g.passed).length).toBe(3);
  });
});
