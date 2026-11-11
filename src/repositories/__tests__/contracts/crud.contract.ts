// Generic CRUD contract test. Shared across all CrudRepository implementations.
// Each repo wrapper provides: valid create, invalid create, valid update, expected dataOrigin.

import type { BaseEntity, CrudRepository } from '@/repositories/types';

export interface CrudContractConfig<T extends BaseEntity, TCreate, TUpdate> {
  readonly getRepo: () => CrudRepository<T, TCreate, TUpdate>;
  readonly validCreate: TCreate;
  readonly invalidCreate: TCreate;
  readonly validUpdate: TUpdate;
  readonly expectedDataOrigin: 'demo' | 'real';
}

export function crudRepositoryContract<T extends BaseEntity, TCreate, TUpdate>(
  config: CrudContractConfig<T, TCreate, TUpdate>,
): void {
  describe('CrudRepository contract', () => {
    it('getById returns null for unknown id', async () => {
      const repo = config.getRepo();
      const r = await repo.getById('nonexistent');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });

    it('create returns an entity with correct dataOrigin and timestamps', async () => {
      const repo = config.getRepo();
      const r = await repo.create(config.validCreate);
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.id).toBeTruthy();
        expect(r.value.dataOrigin).toBe(config.expectedDataOrigin);
        expect(r.value.createdAt).toBeTruthy();
        expect(r.value.updatedAt).toBeTruthy();
      }
    });

    it('rejects invalid input via Validation error', async () => {
      const repo = config.getRepo();
      const r = await repo.create(config.invalidCreate);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('Validation');
    });

    it('created entity can be retrieved by id', async () => {
      const repo = config.getRepo();
      const created = await repo.create(config.validCreate);
      if (!created.ok) throw new Error('setup failed');
      const r = await repo.getById(created.value.id);
      expect(r.ok).toBe(true);
      if (r.ok && r.value) expect(r.value.id).toBe(created.value.id);
    });

    it('update modifies fields and updatedAt', async () => {
      const repo = config.getRepo();
      const created = await repo.create(config.validCreate);
      if (!created.ok) throw new Error('setup failed');
      const r = await repo.update(created.value.id, config.validUpdate);
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.updatedAt >= created.value.updatedAt).toBe(true);
        expect(r.value.dataOrigin).toBe(config.expectedDataOrigin);
      }
    });

    it('update returns NotFound for unknown id', async () => {
      const repo = config.getRepo();
      const r = await repo.update('nonexistent', config.validUpdate);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('NotFound');
    });

    it('delete removes the entity', async () => {
      const repo = config.getRepo();
      const created = await repo.create(config.validCreate);
      if (!created.ok) throw new Error('setup failed');
      const d = await repo.delete(created.value.id);
      expect(d.ok).toBe(true);
      const r = await repo.getById(created.value.id);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });

    it('list returns PagedResult with correct totals', async () => {
      const repo = config.getRepo();
      await repo.create(config.validCreate);
      await repo.create(config.validCreate);
      await repo.create(config.validCreate);
      const r = await repo.list();
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.total).toBe(3);
        expect(r.value.items.length).toBe(3);
        expect(r.value.limit).toBe(20);
        expect(r.value.offset).toBe(0);
      }
    });

    it('list respects limit and offset', async () => {
      const repo = config.getRepo();
      for (let i = 0; i < 5; i += 1) {
        await repo.create(config.validCreate);
      }
      const r = await repo.list({ limit: 2, offset: 1 });
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.items.length).toBe(2);
        expect(r.value.total).toBe(5);
        expect(r.value.limit).toBe(2);
        expect(r.value.offset).toBe(1);
      }
    });
  });
}
