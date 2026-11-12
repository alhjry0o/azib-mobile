import { semanticColors } from '../colors';
import { contrastRatio, passesAA, relativeLuminance } from '../contrast';

describe('contrast utilities', () => {
  it('relativeLuminance(white) === 1', () => {
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 2);
  });

  it('relativeLuminance(black) === 0', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
  });

  it('contrastRatio(white, black) ≈ 21', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeGreaterThan(20.9);
  });

  it('contrastRatio(a, a) === 1', () => {
    expect(contrastRatio('#7136C9', '#7136C9')).toBeCloseTo(1, 2);
  });

  it('accepts 3-digit hex', () => {
    expect(() => contrastRatio('#FFF', '#000')).not.toThrow();
  });

  it('throws on invalid hex', () => {
    expect(() => contrastRatio('not-a-color', '#000')).toThrow();
  });

  it('passesAA(white on black) is true', () => {
    expect(passesAA('#FFFFFF', '#000000')).toBe(true);
  });
});

// WCAG AA test matrix for required semantic pairs.
// Every pair here MUST pass 4.5:1 (normal text).
const requiredPairs: readonly (readonly [string, string, string])[] = [
  ['text.primary / bg.canvas', semanticColors.text.primary, semanticColors.bg.canvas],
  ['text.primary / bg.surface', semanticColors.text.primary, semanticColors.bg.surface],
  ['text.primary / bg.raised', semanticColors.text.primary, semanticColors.bg.raised],
  ['text.secondary / bg.canvas', semanticColors.text.secondary, semanticColors.bg.canvas],
  ['text.secondary / bg.surface', semanticColors.text.secondary, semanticColors.bg.surface],
  ['text.secondary / bg.raised', semanticColors.text.secondary, semanticColors.bg.raised],
  ['text.accent / bg.canvas', semanticColors.text.accent, semanticColors.bg.canvas],
  ['text.accent / bg.surface', semanticColors.text.accent, semanticColors.bg.surface],
  [
    'text.accentOnRaised / bg.raised',
    semanticColors.text.accentOnRaised,
    semanticColors.bg.raised,
  ],
  ['text.gold / bg.canvas', semanticColors.text.gold, semanticColors.bg.canvas],
  ['text.gold / bg.surface', semanticColors.text.gold, semanticColors.bg.surface],
  ['text.gold / bg.raised', semanticColors.text.gold, semanticColors.bg.raised],
  ['text.primary / accent.fill', semanticColors.text.primary, semanticColors.accent.fill],
  ['text.inverse / gold.fill', semanticColors.text.inverse, semanticColors.gold.fill],
  ['state.success / bg.canvas', semanticColors.state.success, semanticColors.bg.canvas],
  ['state.danger / bg.canvas', semanticColors.state.danger, semanticColors.bg.canvas],
  ['state.info / bg.canvas', semanticColors.state.info, semanticColors.bg.canvas],
];

describe('WCAG AA — required semantic pairs (>= 4.5:1)', () => {
  it.each(requiredPairs)('%s', (_name, fg, bg) => {
    const ratio = contrastRatio(fg, bg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

describe('documented exceptions (do not use these pairs)', () => {
  it('text.inverse / accent.fill fails — buttons use text.primary on purple', () => {
    const ratio = contrastRatio(semanticColors.text.inverse, semanticColors.accent.fill);
    expect(ratio).toBeLessThan(4.5);
  });

  it('text.tertiary / bg.canvas is < 4.5 (large text only)', () => {
    const ratio = contrastRatio(semanticColors.text.tertiary, semanticColors.bg.canvas);
    expect(ratio).toBeGreaterThanOrEqual(3);
    expect(ratio).toBeLessThan(4.5);
  });
});
