// Shared contract for AppendOnlyRepository implementations (donation, disbursement).

import type { AppendOnlyRepository, BaseEntity } from '@/repositories/types';

export interface AppendOnlyContractConfig<T extends BaseEntity, TCreate> {
  readonly getRepo: () => AppendOnlyRepository<T, TCreate>;
  readonly validCreate: TCreate;
  readonly invalidCreate: TCreate;
  readonly expectedDataOrigin: 'demo' | 'real';
}

export function appendOnlyRepositoryContract<T extends BaseEntity, TCreate>(
  config: AppendOnlyContractConfig<T, TCreate>,
): void {
  describe('AppendOnlyRepository contract', () => {
    it('getById returns null for unknown id', async () => {
      const repo = config.getRepo();
      const r = await repo.getById('nonexistent');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });

    it('create returns an entity with correct dataOrigin', async () => {
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

    it('create rejects invalid input via Validation error', async () => {
      const repo = config.getRepo();
      const r = await repo.create(config.invalidCreate);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('Validation');
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
      }
    });
  });
}
