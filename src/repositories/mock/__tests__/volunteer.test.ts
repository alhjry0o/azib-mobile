import { crudRepositoryContract } from '../../__tests__/contracts/crud.contract';
import { createMockVolunteerRepository } from '../volunteer';

describe('MockVolunteerRepository', () => {
  crudRepositoryContract({
    getRepo: () => createMockVolunteerRepository(),
    validCreate: {
      userId: 'user-1',
      skillKey: 'volunteer.skills.teaching',
    },
    invalidCreate: {
      userId: '',
      skillKey: '',
    },
    validUpdate: { status: 'inactive' as const },
    expectedDataOrigin: 'demo',
  });

  it('forceErrorKind: Network causes all methods to fail', async () => {
    const repo = createMockVolunteerRepository({ forceErrorKind: 'Network' });
    const r = await repo.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Network');
  });
});
