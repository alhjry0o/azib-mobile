import type { ApplicationRepository } from '@/repositories/contracts/application';

export function applicationRepositoryContract(getRepo: () => ApplicationRepository): void {
  describe('ApplicationRepository contract', () => {
    it('getById returns null for unknown id', async () => {
      const repo = getRepo();
      const r = await repo.getById('nonexistent');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });

    it('create returns a draft application with dataOrigin=demo', async () => {
      const repo = getRepo();
      const r = await repo.create({
        applicantId: 'a1',
        programId: 'p1',
        requestedAmount: 5000,
      });
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.status).toBe('draft');
        expect(r.value.dataOrigin).toBe('demo');
        expect(r.value.currency).toBe('YER');
      }
    });

    it('rejects invalid input via Validation error', async () => {
      const repo = getRepo();
      const r = await repo.create({
        applicantId: '',
        programId: '',
        requestedAmount: -1,
      });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('Validation');
    });

    it('updateStatus changes status and preserves dataOrigin', async () => {
      const repo = getRepo();
      const created = await repo.create({
        applicantId: 'a2',
        programId: 'p2',
        requestedAmount: 3000,
      });
      if (!created.ok) throw new Error('setup failed');
      const r = await repo.updateStatus(created.value.id, 'reviewing');
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.status).toBe('reviewing');
        expect(r.value.dataOrigin).toBe('demo');
      }
    });

    it('updateStatus returns NotFound for unknown id', async () => {
      const repo = getRepo();
      const r = await repo.updateStatus('nope', 'approved');
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('NotFound');
    });

    it('listByApplicant returns all applications for the applicant', async () => {
      const repo = getRepo();
      await repo.create({ applicantId: 'a3', programId: 'p1', requestedAmount: 1000 });
      await repo.create({ applicantId: 'a3', programId: 'p2', requestedAmount: 2000 });
      await repo.create({ applicantId: 'other', programId: 'p1', requestedAmount: 500 });
      const r = await repo.listByApplicant('a3');
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.length).toBe(2);
        expect(r.value.every((a) => a.applicantId === 'a3')).toBe(true);
      }
    });

    it('list filters by status and programId', async () => {
      const repo = getRepo();
      const c1 = await repo.create({
        applicantId: 'x',
        programId: 'pA',
        requestedAmount: 100,
      });
      await repo.create({ applicantId: 'x', programId: 'pB', requestedAmount: 200 });
      if (!c1.ok) throw new Error('setup failed');
      await repo.updateStatus(c1.value.id, 'approved');
      const r = await repo.list({ status: 'approved' });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value.total).toBe(1);
    });

    it('delete removes the application', async () => {
      const repo = getRepo();
      const c = await repo.create({ applicantId: 'z', programId: 'p', requestedAmount: 1 });
      if (!c.ok) throw new Error('setup failed');
      const d = await repo.delete(c.value.id);
      expect(d.ok).toBe(true);
      const r = await repo.getById(c.value.id);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });
  });
}
