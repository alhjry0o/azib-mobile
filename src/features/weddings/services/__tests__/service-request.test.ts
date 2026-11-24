import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockNotificationRepository } from '@/repositories/mock/notification';
import { createMockWeddingRepository } from '@/repositories/mock/wedding';
import { createMockWeddingBudgetRepository } from '@/repositories/mock/wedding-budget';
import { createMockWeddingGroupRepository } from '@/repositories/mock/wedding-group';
import { createGroup } from '../group-service';
import { createServiceRequest, respondServiceRequest } from '../service-request-service';

describe('service requests (no payment, no tracking)', () => {
  it('creates a request and records acceptance without any amount field', async () => {
    const deps = {
      budgets: createMockWeddingBudgetRepository(),
      groups: createMockWeddingGroupRepository(),
      weddings: createMockWeddingRepository(),
      notifications: createMockNotificationRepository(),
      audit: createMockAuditRepository(),
    };
    const group = await createGroup(deps, {
      organizerId: 'organizer-1',
      title: 'Demo group',
      governorateId: 'sanaa',
      districtId: null,
      city: null,
      scheduledDate: '2026-06-15T16:00:00.000Z',
      alternateDate: null,
      targetCount: 6,
      description: null,
      maxGroupSize: 12,
    });
    if (!group.ok) throw new Error('setup failed');

    const created = await createServiceRequest(deps, group.value.id, 'organizer-1', {
      partnerId: 'partner-1',
      categoryKey: 'hall',
      message: 'Availability?',
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(Object.keys(created.value)).not.toContain('amountPaid');

    const accepted = await respondServiceRequest(
      deps,
      group.value.id,
      created.value.id,
      'organizer-1',
      'accepted',
      'Available',
    );
    expect(accepted.ok).toBe(true);
    if (accepted.ok) expect(accepted.value.status).toBe('accepted');
  });

  it('refuses non-members', async () => {
    const deps = {
      budgets: createMockWeddingBudgetRepository(),
      groups: createMockWeddingGroupRepository(),
      weddings: createMockWeddingRepository(),
      notifications: createMockNotificationRepository(),
      audit: createMockAuditRepository(),
    };
    const group = await createGroup(deps, {
      organizerId: 'organizer-1',
      title: 'Demo group',
      governorateId: 'sanaa',
      districtId: null,
      city: null,
      scheduledDate: '2026-06-15T16:00:00.000Z',
      alternateDate: null,
      targetCount: 6,
      description: null,
      maxGroupSize: 12,
    });
    if (!group.ok) throw new Error('setup failed');
    const denied = await createServiceRequest(deps, group.value.id, 'nobody', {
      partnerId: 'p',
      categoryKey: 'hall',
      message: 'x',
    });
    expect(denied.ok).toBe(false);
  });
});
