import type { ProgramRepository } from '@/repositories/contracts/program';

export function programRepositoryContract(getRepo: () => ProgramRepository): void {
  describe('ProgramRepository contract', () => {
    it('getById returns null for unknown id', async () => {
      const repo = getRepo();
      const r = await repo.getById('nonexistent');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });

    it('create returns a program with dataOrigin=demo and YER', async () => {
      const repo = getRepo();
      const r = await repo.create({
        nameKey: 'programs.basic',
        descriptionKey: 'programs.basic.desc',
        minAmount: 1000,
        maxAmount: 50000,
      });
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.currency).toBe('YER');
        expect(r.value.dataOrigin).toBe('demo');
        expect(r.value.status).toBe('draft');
      }
    });

    it('rejects invalid input via Validation error', async () => {
      const repo = getRepo();
      const r = await repo.create({
        nameKey: '',
        descriptionKey: '',
        minAmount: -1,
        maxAmount: -1,
      });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('Validation');
    });

    it('update modifies fields', async () => {
      const repo = getRepo();
      const c = await repo.create({
        nameKey: 'p.old',
        descriptionKey: 'p.old.d',
        minAmount: 100,
        maxAmount: 1000,
      });
      if (!c.ok) throw new Error('setup failed');
      const r = await repo.update(c.value.id, { status: 'open' });
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.status).toBe('open');
        expect(r.value.nameKey).toBe('p.old');
      }
    });

    it('update returns NotFound for unknown id', async () => {
      const repo = getRepo();
      const r = await repo.update('nope', { status: 'open' });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('NotFound');
    });

    it('list returns PagedResult', async () => {
      const repo = getRepo();
      await repo.create({
        nameKey: 'a',
        descriptionKey: 'a.d',
        minAmount: 1,
        maxAmount: 2,
      });
      await repo.create({
        nameKey: 'b',
        descriptionKey: 'b.d',
        minAmount: 1,
        maxAmount: 2,
      });
      const r = await repo.list();
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value.total).toBe(2);
    });

    it('delete removes the program', async () => {
      const repo = getRepo();
      const c = await repo.create({
        nameKey: 'x',
        descriptionKey: 'x.d',
        minAmount: 1,
        maxAmount: 2,
      });
      if (!c.ok) throw new Error('setup failed');
      const d = await repo.delete(c.value.id);
      expect(d.ok).toBe(true);
      const r = await repo.getById(c.value.id);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });
  });
}
