import { createMockNotificationRepository } from '../notification';

describe('MockNotificationRepository.create (P10.1)', () => {
  it('creates an unread demo notification', async () => {
    const repo = createMockNotificationRepository();
    const created = await repo.create({
      userId: 'u1',
      titleKey: 'weddings:notifications.invite.title',
      bodyKey: 'weddings:notifications.invite.body',
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.value.read).toBe(false);
    expect(created.value.dataOrigin).toBe('demo');
    const listed = await repo.list();
    if (listed.ok) expect(listed.value.total).toBe(1);
  });

  it('rejects invalid input and keeps markRead/delete working', async () => {
    const repo = createMockNotificationRepository();
    const bad = await repo.create({ userId: '', titleKey: '', bodyKey: '' });
    expect(bad.ok).toBe(false);
    const created = await repo.create({ userId: 'u1', titleKey: 't', bodyKey: 'b' });
    if (!created.ok) throw new Error('setup failed');
    const read = await repo.markRead(created.value.id);
    expect(read.ok).toBe(true);
    const deleted = await repo.delete(created.value.id);
    expect(deleted.ok).toBe(true);
  });
});
