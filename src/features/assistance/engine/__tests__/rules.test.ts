import { RULES_V1, TOTAL_WEIGHT } from '../rules.v1';
import {
  createStaticRulesSource,
  getRulesSource,
  resetRulesSource,
  setRulesSource,
} from '../rules-source';

describe('eligibility rules v1', () => {
  it('weights sum to exactly 100', () => {
    expect(TOTAL_WEIGHT).toBe(100);
  });

  it('is marked as awaiting human approval', () => {
    expect(RULES_V1.policyStatus).toBe('pending-human-approval');
    expect(RULES_V1.scoreVisibility).toBe('hidden');
  });

  it('uses the owner-provided provisional values', () => {
    expect(RULES_V1.gates.availableAssetsThreshold).toBe(500_000);
    expect(RULES_V1.gates.allowPriorAssistanceException).toBe(false);
    expect(RULES_V1.appealWindowDays).toBe(14);
    expect(RULES_V1.documentLimits.imageMaxBytes).toBe(5 * 1024 * 1024);
    expect(RULES_V1.documentLimits.pdfMaxBytes).toBe(10 * 1024 * 1024);
  });

  it('bands cover 0..100 without gaps or overlap', () => {
    const bands = [...RULES_V1.bands].sort((a, b) => a.min - b.min);
    expect(bands[0]?.min).toBe(0);
    expect(bands[bands.length - 1]?.max).toBe(100);
    for (let i = 1; i < bands.length; i += 1) {
      const previous = bands[i - 1];
      const current = bands[i];
      expect(current?.min).toBe((previous?.max ?? 0) + 1);
    }
  });

  it('every band label and recommendation is an i18n key', () => {
    for (const band of RULES_V1.bands) {
      expect(band.labelKey.startsWith('assistance:')).toBe(true);
      expect(band.recommendationKey.startsWith('assistance:')).toBe(true);
    }
  });
});

describe('rules source', () => {
  afterEach(() => {
    resetRulesSource();
  });

  it('loads the active version', async () => {
    const result = await createStaticRulesSource().load();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.version).toBe(RULES_V1.version);
  });

  it('is swappable without touching the engine', async () => {
    setRulesSource({
      id: 'test',
      load: async () => ({ ok: true, value: { ...RULES_V1, version: 'test-v9' } }),
    });
    expect(getRulesSource().id).toBe('test');
    const result = await getRulesSource().load();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.version).toBe('test-v9');
    resetRulesSource();
    expect(getRulesSource().id).toContain(RULES_V1.version);
  });
});
