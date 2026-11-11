import { createMockSettingsRepository } from '../settings';

describe('MockSettingsRepository', () => {
  it('get returns null for unknown key', async () => {
    const repo = createMockSettingsRepository();
    const r = await repo.get('missing');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(null);
  });

  it('update creates a setting when absent', async () => {
    const repo = createMockSettingsRepository();
    const r = await repo.update('theme', { color: 'dark' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.key).toBe('theme');
      expect(r.value.value).toEqual({ color: 'dark' });
    }
  });

  it('update overwrites an existing setting', async () => {
    const repo = createMockSettingsRepository();
    await repo.update('theme', { color: 'dark' });
    const r = await repo.update('theme', { color: 'light' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.value).toEqual({ color: 'light' });
  });

  it('get returns the latest value', async () => {
    const repo = createMockSettingsRepository();
    await repo.update('k', { v: 1 });
    const r = await repo.get('k');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value?.value).toEqual({ v: 1 });
  });

  it('update rejects invalid (non-object) input', async () => {
    const repo = createMockSettingsRepository();
    // Deliberately wrong type to exercise zod rejection at runtime.
    const r = await repo.update('k', 'not-an-object' as unknown as Record<string, unknown>);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Validation');
  });

  it('forceErrorKind: Network causes all methods to fail', async () => {
    const repo = createMockSettingsRepository({ forceErrorKind: 'Network' });
    const r = await repo.get('any');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Network');
  });
});
