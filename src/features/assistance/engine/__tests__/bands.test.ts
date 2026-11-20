import { GATE_FAILED_BAND_ID, resolveBand } from '../bands';
import { RULES_V1 } from '../rules.v1';

describe('resolveBand boundary table', () => {
  const cases: readonly [number, string][] = [
    [0, 'not_eligible'],
    [30, 'not_eligible'],
    [31, 'additional_review'],
    [55, 'additional_review'],
    [56, 'partial'],
    [75, 'partial'],
    [76, 'full'],
    [100, 'full'],
  ];

  for (const [score, expected] of cases) {
    it(`maps ${score} to ${expected}`, () => {
      expect(resolveBand(score, RULES_V1).id).toBe(expected);
    });
  }

  it('rounds fractional scores before banding', () => {
    expect(resolveBand(30.4, RULES_V1).id).toBe('not_eligible');
    expect(resolveBand(30.6, RULES_V1).id).toBe('additional_review');
  });

  it('reads bands from the rules, not from hardcoded numbers', () => {
    const shifted = {
      ...RULES_V1,
      bands: [
        { id: 'only', labelKey: 'assistance:bands.full', recommendationKey: 'assistance:recommendations.full', min: 0, max: 100 },
      ],
    };
    expect(resolveBand(10, shifted).id).toBe('only');
  });

  it('exposes a distinct gate-failed band id', () => {
    expect(GATE_FAILED_BAND_ID).toBe('gates_failed');
  });
});
