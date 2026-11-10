import { applicationRepositoryContract } from '../../__tests__/contracts/application.contract';
import { createMockApplicationRepository } from '../application';

describe('MockApplicationRepository', () => {
  applicationRepositoryContract(() => createMockApplicationRepository());

  describe('mock-specific', () => {
    it('forceErrorKind: Network causes all methods to fail', async () => {
      const repo = createMockApplicationRepository({ forceErrorKind: 'Network' });
      const r = await repo.list();
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('Network');
    });
  });
});
