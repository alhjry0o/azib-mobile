import { createMockAmbassadorRepository } from '@/repositories/mock/ambassador';
import { createMockAuditRepository } from '@/repositories/mock/audit';
import {
  applyAmbassador,
  createAmbassadorTask,
  decideAmbassadorApplication,
  submitAmbassadorTask,
} from '../ambassador-service';
import { AMBASSADOR_FORBIDDEN, can } from '../../state/permissions';

function setup() {
  return { ambassadors: createMockAmbassadorRepository(), audit: createMockAuditRepository() };
}

describe('ambassador service', () => {
  it('applies once and needs staff approval', async () => {
    const deps = setup();
    const applied = await applyAmbassador(
      deps,
      'user-1',
      ['sanaa'],
      'I can nominate partners across my region.',
    );
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    const denied = await decideAmbassadorApplication(
      deps,
      applied.value.id,
      'ambassador',
      'user-1',
      'approved',
    );
    expect(denied.ok).toBe(false);
    const approved = await decideAmbassadorApplication(
      deps,
      applied.value.id,
      'moderator',
      'mod-1',
      'approved',
    );
    expect(approved.ok).toBe(true);
  });

  it('validates the application and refuses a second one', async () => {
    const deps = setup();
    expect((await applyAmbassador(deps, 'u', [], 'short')).ok).toBe(false);
    await applyAmbassador(deps, 'u2', ['sanaa'], 'I can nominate partners across my region.');
    const twice = await applyAmbassador(
      deps,
      'u2',
      ['sanaa'],
      'I can nominate partners across my region.',
    );
    expect(twice.ok).toBe(false);
  });

  it('submits a task only inside the assigned region', async () => {
    const deps = setup();
    const applied = await applyAmbassador(
      deps,
      'user-1',
      ['sanaa'],
      'I can nominate partners across my region.',
    );
    if (!applied.ok) throw new Error('setup failed');
    await decideAmbassadorApplication(deps, applied.value.id, 'admin', 'admin-1', 'approved');
    const inside = await createAmbassadorTask(
      deps,
      'admin',
      'admin-1',
      'user-1',
      'nominate_partner',
      'sanaa',
      'marketplace:ambassador.taskNominate',
    );
    const outside = await createAmbassadorTask(
      deps,
      'admin',
      'admin-1',
      'user-1',
      'activity_photos',
      'aden',
      'marketplace:ambassador.taskNominate',
    );
    if (!inside.ok || !outside.ok) throw new Error('setup failed');

    const rejected = await submitAmbassadorTask(deps, outside.value.id, 'user-1', {
      nominatedPartnerId: 'p1',
      photoFileIds: [],
    });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.error.meta.code).toBe('REGION_NOT_ASSIGNED');

    const accepted = await submitAmbassadorTask(deps, inside.value.id, 'user-1', {
      nominatedPartnerId: 'p1',
      photoFileIds: [],
    });
    expect(accepted.ok).toBe(true);
  });

  it('cannot submit another ambassador task', async () => {
    const deps = setup();
    await applyAmbassador(deps, 'owner', ['sanaa'], 'I can nominate partners across my region.');
    const tasks = await deps.ambassadors.listTasks('other');
    if (tasks.ok) expect(tasks.value.length).toBe(0);
    const forged = await submitAmbassadorTask(deps, 'unknown-task', 'owner', {
      nominatedPartnerId: 'p1',
      photoFileIds: [],
    });
    expect(forged.ok).toBe(false);
  });

  it('has no capability to read beneficiary data or verification documents', () => {
    const deps = setup();
    expect(Object.keys(deps).sort()).toEqual(['ambassadors', 'audit']);
    for (const permission of AMBASSADOR_FORBIDDEN) {
      expect(can('ambassador', permission)).toBe(false);
    }
    expect(can('ambassador', 'view_verification_documents')).toBe(false);
    expect(can('ambassador', 'view_beneficiary_data')).toBe(false);
  });
});
