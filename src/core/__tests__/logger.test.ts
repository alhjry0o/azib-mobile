import { redact, redactString } from '@/core/logger';

describe('logger.redactString', () => {
  it('redacts email addresses', () => {
    expect(redactString('contact user@example.com please')).toBe(
      'contact [REDACTED_EMAIL] please',
    );
  });

  it('redacts JWT tokens', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.abcdefghijklmnop';
    expect(redactString(`Token: ${jwt}`)).toContain('[REDACTED_TOKEN]');
  });

  it('redacts bearer tokens', () => {
    expect(redactString('Authorization: Bearer abc.def.ghi')).toBe(
      'Authorization: Bearer [REDACTED_TOKEN]',
    );
  });

  it('redacts phone-like strings', () => {
    const out = redactString('Call me at +967712345678');
    expect(out).not.toContain('712345678');
    expect(out).toContain('[REDACTED_PHONE]');
  });

  it('redacts card-like numbers', () => {
    expect(redactString('4242 4242 4242 4242')).toBe('[REDACTED_CARD]');
    expect(redactString('4242424242424242')).toBe('[REDACTED_CARD]');
  });

  it('leaves ordinary text unchanged', () => {
    expect(redactString('Hello world')).toBe('Hello world');
  });
});

describe('logger.redact', () => {
  it('recurses into plain objects', () => {
    const out = redact({ email: 'a@b.co', name: 'X' });
    expect(out).toEqual({ email: '[REDACTED_EMAIL]', name: 'X' });
  });

  it('recurses into arrays', () => {
    const out = redact(['a@b.co', 'foo']);
    expect(out).toEqual(['[REDACTED_EMAIL]', 'foo']);
  });

  it('handles Error objects', () => {
    const out = redact(new Error('user@example.com failed'));
    expect(out).toEqual({ name: 'Error', message: '[REDACTED_EMAIL] failed' });
  });

  it('caps recursion depth', () => {
    type Deep = { next?: Deep };
    const root: Deep = {};
    let node = root;
    for (let i = 0; i < 20; i += 1) {
      node.next = {};
      node = node.next;
    }
    const out = redact(root);
    expect(JSON.stringify(out)).toContain('[DEPTH_LIMIT]');
  });

  it('passes through primitives', () => {
    expect(redact(42)).toBe(42);
    expect(redact(true)).toBe(true);
    expect(redact(null)).toBe(null);
    expect(redact(undefined)).toBe(undefined);
  });
});
