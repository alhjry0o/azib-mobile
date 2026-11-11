import { createMockAuditRepository } from '../audit';

describe('MockAuditRepository', () => {
  it('getById returns null for unknown id', async () => {
    const repo = createMockAuditRepository();
    const r = await repo.getById('missing');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(null);
  });

  it('append stores an entry with dataOrigin=demo', async () => {
    const repo = createMockAuditRepository();
    const r = await repo.append({
      actorId: 'u1',
      action: 'application.approve',
      target: 'application:1',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.dataOrigin).toBe('demo');
      expect(r.value.meta).toEqual({});
    }
  });

  it('append preserves meta when provided', async () => {
    const repo = createMockAuditRepository();
    const r = await repo.append({
      actorId: 'u1',
      action: 'reviewer.decide',
      target: 'application:2',
      meta: { reason: 'verified' },
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.meta).toEqual({ reason: 'verified' });
  });

  it('append rejects invalid input via Validation error', async () => {
    const repo = createMockAuditRepository();
    const r = await repo.append({ actorId: '', action: '', target: '' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Validation');
  });

  it('has no update or delete (append-only)', () => {
    const repo = createMockAuditRepository();
    expect('update' in repo).toBe(false);
    expect('delete' in repo).toBe(false);
  });

  it('list returns PagedResult', async () => {
    const repo = createMockAuditRepository();
    await repo.append({ actorId: 'u1', action: 'a', target: 't' });
    await repo.append({ actorId: 'u1', action: 'a', target: 't' });
    const r = await repo.list();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.total).toBe(2);
  });

  it('forceErrorKind: Unknown causes all methods to fail', async () => {
    const repo = createMockAuditRepository({ forceErrorKind: 'Unknown' });
    const r = await repo.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Unknown');
  });
});
