import { programRepositoryContract } from '../../__tests__/contracts/program.contract';
import { createMockProgramRepository } from '../program';

describe('MockProgramRepository', () => {
  programRepositoryContract(() => createMockProgramRepository());

  describe('mock-specific', () => {
    it('forceErrorKind: Unknown causes all methods to fail', async () => {
      const repo = createMockProgramRepository({ forceErrorKind: 'Unknown' });
      const r = await repo.list();
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('Unknown');
    });
  });
});
