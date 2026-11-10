import type { ProfileRepository } from '@/repositories/contracts/profile';

export function profileRepositoryContract(getRepo: () => ProfileRepository): void {
  describe('ProfileRepository contract', () => {
    it('getById returns null for unknown id', async () => {
      const repo = getRepo();
      const r = await repo.getById('nonexistent');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });

    it('getByUserId returns null when no profile exists', async () => {
      const repo = getRepo();
      const r = await repo.getByUserId('unknown-user');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });

    it('create returns a profile with dataOrigin=demo', async () => {
      const repo = getRepo();
      const r = await repo.create({
        userId: 'user-1',
        displayName: 'Test Person',
        gender: 'male',
        maritalStatus: 'single',
      });
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.userId).toBe('user-1');
        expect(r.value.dataOrigin).toBe('demo');
        expect(r.value.id).toBeTruthy();
        expect(r.value.createdAt).toBeTruthy();
        expect(r.value.updatedAt).toBeTruthy();
      }
    });

    it('rejects invalid input via Validation error', async () => {
      const repo = getRepo();
      const r = await repo.create({
        userId: '',
        displayName: '',
        gender: 'male',
        maritalStatus: 'single',
      });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('Validation');
    });

    it('created profile can be retrieved by id and userId', async () => {
      const repo = getRepo();
      const created = await repo.create({
        userId: 'user-2',
        displayName: 'Retrieve Me',
        gender: 'female',
        maritalStatus: 'single',
        city: 'Sanaa',
      });
      if (!created.ok) throw new Error('setup failed');
      const byId = await repo.getById(created.value.id);
      expect(byId.ok).toBe(true);
      if (byId.ok && byId.value) expect(byId.value.id).toBe(created.value.id);
      const byUser = await repo.getByUserId('user-2');
      expect(byUser.ok).toBe(true);
      if (byUser.ok && byUser.value) expect(byUser.value.userId).toBe('user-2');
    });

    it('update modifies fields and updatedAt', async () => {
      const repo = getRepo();
      const created = await repo.create({
        userId: 'u3',
        displayName: 'Before',
        gender: 'male',
        maritalStatus: 'single',
      });
      if (!created.ok) throw new Error('setup failed');
      const r = await repo.update(created.value.id, { displayName: 'After' });
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.displayName).toBe('After');
        expect(r.value.updatedAt >= created.value.updatedAt).toBe(true);
      }
    });

    it('update returns NotFound for unknown id', async () => {
      const repo = getRepo();
      const r = await repo.update('nope', { displayName: 'X' });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('NotFound');
    });

    it('delete removes the profile', async () => {
      const repo = getRepo();
      const created = await repo.create({
        userId: 'u4',
        displayName: 'Delete Me',
        gender: 'male',
        maritalStatus: 'single',
      });
      if (!created.ok) throw new Error('setup failed');
      const del = await repo.delete(created.value.id);
      expect(del.ok).toBe(true);
      const r = await repo.getById(created.value.id);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });

    it('list returns PagedResult and respects filters', async () => {
      const repo = getRepo();
      await repo.create({
        userId: 'a',
        displayName: 'A',
        gender: 'male',
        maritalStatus: 'single',
        city: 'Sanaa',
      });
      await repo.create({
        userId: 'b',
        displayName: 'B',
        gender: 'male',
        maritalStatus: 'married',
        city: 'Aden',
      });
      const r = await repo.list({ city: 'Sanaa' });
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.total).toBe(1);
        expect(r.value.items[0]?.city).toBe('Sanaa');
      }
    });

    it('list respects limit/offset', async () => {
      const repo = getRepo();
      for (let i = 0; i < 5; i += 1) {
        await repo.create({
          userId: `u${i}`,
          displayName: `P${i}`,
          gender: 'unspecified',
          maritalStatus: 'single',
        });
      }
      const page = await repo.list({ limit: 2, offset: 1 });
      expect(page.ok).toBe(true);
      if (page.ok) {
        expect(page.value.items.length).toBe(2);
        expect(page.value.total).toBe(5);
        expect(page.value.limit).toBe(2);
        expect(page.value.offset).toBe(1);
      }
    });
  });
}
