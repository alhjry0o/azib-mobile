import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockVolunteerRepository } from '@/repositories/mock/volunteer';
import { createMockVolunteerTaskRepository } from '@/repositories/mock/volunteer-task';
import { registerVolunteer } from '../registration-service';
import {
  acceptTask,
  assignTask,
  cancelTask,
  completeTask,
  declineTask,
  reviewTask,
} from '../task-service';
import { emptyAvailability, toggleCell } from '../../state/availability';

function setup() {
  return {
    volunteers: createMockVolunteerRepository(),
    tasks: createMockVolunteerTaskRepository(),
    audit: createMockAuditRepository(),
  };
}

const registration = {
  userId: 'volunteer-1',
  skillKey: 'volunteer.skills.teaching',
  governorateIds: ['sanaa'],
  skills: ['volunteer.skills.teaching'],
  helpTypes: ['donation_delivery'] as const,
  availability: toggleCell(emptyAvailability(), 0),
  note: null,
};

describe('volunteer deps have no forbidden capability', () => {
  it('exposes only volunteers, tasks and audit', () => {
    const deps = setup();
    expect(Object.keys(deps).sort()).toEqual(['audit', 'tasks', 'volunteers']);
    expect(Object.keys(deps)).not.toContain('applications');
    expect(Object.keys(deps)).not.toContain('partnerVerifications');
    expect(Object.keys(deps)).not.toContain('jobApplications');
  });
});

describe('volunteer registration', () => {
  it('registers then updates the same profile without duplicating', async () => {
    const deps = setup();
    const created = await registerVolunteer(deps, registration);
    expect(created.ok).toBe(true);
    const again = await registerVolunteer(deps, {
      ...registration,
      governorateIds: ['sanaa', 'aden'],
    });
    expect(again.ok).toBe(true);
    const listed = await deps.volunteers.list();
    if (listed.ok) expect(listed.value.total).toBe(1);
    if (again.ok) expect(again.value.governorateIds).toEqual(['sanaa', 'aden']);
  });

  it('requires regions, help types and a 21-cell grid', async () => {
    const deps = setup();
    expect((await registerVolunteer(deps, { ...registration, governorateIds: [] })).ok).toBe(
      false,
    );
    expect((await registerVolunteer(deps, { ...registration, helpTypes: [] })).ok).toBe(false);
    expect((await registerVolunteer(deps, { ...registration, availability: [] })).ok).toBe(false);
  });
});

describe('volunteer task lifecycle', () => {
  async function assigned() {
    const deps = setup();
    await registerVolunteer(deps, registration);
    const task = await assignTask(
      deps,
      'admin',
      'admin-1',
      'volunteer-1',
      'donation_delivery',
      'sanaa',
      'marketplace:volunteers.tasks.delivery',
    );
    if (!task.ok) throw new Error('setup failed');
    return { deps, taskId: task.value.id };
  }

  it('only staff assign, and only the assignee accepts', async () => {
    const deps = setup();
    const denied = await assignTask(
      deps,
      'volunteer',
      'volunteer-1',
      'volunteer-1',
      'donation_delivery',
      'sanaa',
      'marketplace:volunteers.tasks.delivery',
    );
    expect(denied.ok).toBe(false);

    const { deps: d2, taskId } = await assigned();
    const stranger = await acceptTask(d2, taskId, 'someone', new Date());
    expect(stranger.ok).toBe(false);
    const accepted = await acceptTask(d2, taskId, 'volunteer-1', new Date());
    expect(accepted.ok).toBe(true);
  });

  it('completion requires a report, and review is staff-only two-axis', async () => {
    const { deps, taskId } = await assigned();
    const now = new Date();
    await acceptTask(deps, taskId, 'volunteer-1', now);
    const noReport = await completeTask(deps, taskId, 'volunteer-1', 'short', now);
    expect(noReport.ok).toBe(false);
    const completed = await completeTask(
      deps,
      taskId,
      'volunteer-1',
      'Delivered the donated items to the family and confirmed receipt.',
      now,
    );
    expect(completed.ok).toBe(true);

    const denied = await reviewTask(deps, taskId, 'volunteer', 'volunteer-1', 4, 5, null, now);
    expect(denied.ok).toBe(false);
    const reviewed = await reviewTask(deps, taskId, 'moderator', 'mod-1', 4, 5, 'On time', now);
    expect(reviewed.ok).toBe(true);
    if (reviewed.ok) {
      expect(reviewed.value.status).toBe('reviewed');
      expect(reviewed.value.timelinessScore).toBe(4);
      expect(reviewed.value.completionScore).toBe(5);
    }
  });

  it('declines and cancels with a reason, and refuses unknown tasks', async () => {
    const { deps, taskId } = await assigned();
    const now = new Date();
    const declined = await declineTask(deps, taskId, 'volunteer-1', now, 'unavailable');
    expect(declined.ok).toBe(true);

    const second = await assigned();
    const noReason = await cancelTask(second.deps, second.taskId, 'admin', 'admin-1', now, '');
    expect(noReason.ok).toBe(false);
    const cancelled = await cancelTask(
      second.deps,
      second.taskId,
      'admin',
      'admin-1',
      now,
      'marketplace:volunteers.cancelReason',
    );
    expect(cancelled.ok).toBe(true);

    const missing = await acceptTask(deps, 'nope', 'volunteer-1', now);
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.error.kind).toBe('NotFound');
  });
});
