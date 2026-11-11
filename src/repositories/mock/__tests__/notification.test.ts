import type { InAppNotification } from '../../contracts/notification';
import { createMockNotificationRepository } from '../notification';

const seed: readonly InAppNotification[] = [
  {
    id: 'n1',
    userId: 'u1',
    titleKey: 'notifications.welcome.title',
    bodyKey: 'notifications.welcome.body',
    read: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    dataOrigin: 'demo',
  },
];

describe('MockNotificationRepository', () => {
  it('returns null for unknown id', async () => {
    const repo = createMockNotificationRepository();
    const r = await repo.getById('missing');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(null);
  });

  it('markRead flips read flag', async () => {
    const repo = createMockNotificationRepository(undefined, seed);
    const r = await repo.markRead('n1');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.read).toBe(true);
  });

  it('markRead returns NotFound for unknown id', async () => {
    const repo = createMockNotificationRepository();
    const r = await repo.markRead('nope');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('NotFound');
  });

  it('delete removes the notification', async () => {
    const repo = createMockNotificationRepository(undefined, seed);
    const d = await repo.delete('n1');
    expect(d.ok).toBe(true);
    const r = await repo.getById('n1');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(null);
  });

  it('list returns PagedResult', async () => {
    const repo = createMockNotificationRepository(undefined, seed);
    const r = await repo.list();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.total).toBe(1);
  });

  it('forceErrorKind: Network causes all methods to fail', async () => {
    const repo = createMockNotificationRepository({ forceErrorKind: 'Network' });
    const r = await repo.list();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.kind).toBe('Network');
  });
});
