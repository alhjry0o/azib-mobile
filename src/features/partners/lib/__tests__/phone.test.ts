import { cleanYemeniPhone } from '../phone';

function e164(raw: string): string {
  const result = cleanYemeniPhone(raw);
  if (!result.ok) throw new Error(`expected ok for ${raw}`);
  return result.value.e164;
}

describe('Yemeni phone cleaning', () => {
  it('accepts international, double-zero, bare and local forms', () => {
    expect(e164('+967 77 123 4567')).toBe('+967771234567');
    expect(e164('00967-77-123-4567')).toBe('+967771234567');
    expect(e164('967771234567')).toBe('+967771234567');
    expect(e164('0771234567')).toBe('+967771234567');
    expect(e164('771234567')).toBe('+967771234567');
  });

  it('strips spaces, dashes, dots and parentheses', () => {
    expect(e164('(077) 123.4567')).toBe('+967771234567');
  });

  it('produces wa.me digits and a national form', () => {
    const result = cleanYemeniPhone('0771234567');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.digits).toBe('967771234567');
    expect(result.value.national).toBe('771234567');
  });

  it('rejects empty, non-numeric, wrong length and wrong prefixes', () => {
    for (const raw of ['', '   ', 'abc', '12345', '0611234567', '0721234567', '07712345678']) {
      const result = cleanYemeniPhone(raw);
      expect(result.ok).toBe(false);
    }
  });

  it('accepts every valid Yemeni mobile prefix', () => {
    for (const prefix of ['70', '71', '73', '77', '78']) {
      expect(e164(`0${prefix}1234567`)).toBe(`+967${prefix}1234567`);
    }
  });
});
