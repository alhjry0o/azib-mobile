import { profileRepositoryContract } from '../../__tests__/contracts/profile.contract';
import { createMockProfileRepository } from '../profile';

describe('MockProfileRepository', () => {
  profileRepositoryContract(() => createMockProfileRepository());

  describe('mock-specific', () => {
    it('forceErrorKind: Network causes all methods to fail', async () => {
      const repo = createMockProfileRepository({ forceErrorKind: 'Network' });
      const r = await repo.list();
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('Network');
    });

    it('delayMs adds measurable latency', async () => {
      const repo = createMockProfileRepository({ delayMs: 10 });
      const start = Date.now();
      await repo.list();
      expect(Date.now() - start).toBeGreaterThanOrEqual(8);
    });
  });
});
