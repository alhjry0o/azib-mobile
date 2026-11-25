import { createMockSoukChatRepository } from '../souk-chat';
import { createMockSoukReportRepository } from '../souk-report';
import { createMockSoukRequestRepository } from '../souk-request';

describe('MockSoukRequestRepository', () => {
  it('starts pending with no code, no consents and no rating', async () => {
    const repo = createMockSoukRequestRepository();
    const created = await repo.create({
      itemId: 'i1',
      requesterId: 'u1',
      reason: 'Setting up a new home.',
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.value.status).toBe('pending');
    expect(created.value.handoverCode).toBeNull();
    expect(created.value.donorContactConsent).toBe(false);
    expect(created.value.recipientContactConsent).toBe(false);
    expect(created.value.rating).toBeNull();
    expect(created.value.dataOrigin).toBe('demo');
  });

  it('lists by item and by requester, and updates fields', async () => {
    const repo = createMockSoukRequestRepository();
    await repo.create({ itemId: 'i1', requesterId: 'u1', reason: 'Setting up a new home.' });
    await repo.create({ itemId: 'i2', requesterId: 'u1', reason: 'Setting up a new home.' });
    const byItem = await repo.listByItem('i1');
    if (byItem.ok) expect(byItem.value.length).toBe(1);
    const byRequester = await repo.listByRequester('u1');
    if (byRequester.ok) expect(byRequester.value.length).toBe(2);
    const listed = await repo.list();
    if (listed.ok) expect(listed.value.total).toBe(2);
  });

  it('rejects invalid input and returns NotFound on update', async () => {
    const repo = createMockSoukRequestRepository();
    const bad = await repo.create({ itemId: '', requesterId: '', reason: '  ' });
    expect(bad.ok).toBe(false);
    const missing = await repo.update('nope', { status: 'accepted' });
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.error.kind).toBe('NotFound');
  });
});

describe('MockSoukReportRepository', () => {
  it('creates open reports and settles them with an actor', async () => {
    const repo = createMockSoukReportRepository();
    const created = await repo.create({
      itemId: 'i1',
      targetKind: 'item',
      targetId: 'i1',
      reporterId: 'u1',
      reasonKey: 'marketplace:souk.report.reasons.forSale',
      detail: 'Asks for money in exchange.',
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const settled = await repo.updateStatus(created.value.id, 'resolved', 'mod-1', 'ok');
    expect(settled.ok).toBe(true);
    if (settled.ok) {
      expect(settled.value.resolvedBy).toBe('mod-1');
      expect(settled.value.resolvedAt).toBeTruthy();
    }
    const byItem = await repo.listByItem('i1');
    if (byItem.ok) expect(byItem.value.length).toBe(1);
  });

  it('propagates forced errors', async () => {
    const repo = createMockSoukReportRepository({ forceErrorKind: 'Network' });
    const result = await repo.list();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('Network');
  });
});

describe('MockSoukChatRepository', () => {
  it('delivers to subscribers and stops after unsubscribe', async () => {
    const repo = createMockSoukChatRepository();
    const seen: number[] = [];
    const unsubscribe = repo.subscribe('r1', (messages) => seen.push(messages.length));
    expect(seen).toEqual([0]);
    await repo.sendMessage({ requestId: 'r1', authorId: 'u1', text: 'Pickup at noon.' });
    expect(seen[seen.length - 1]).toBe(1);
    unsubscribe();
    await repo.sendMessage({ requestId: 'r1', authorId: 'u1', text: 'Second message.' });
    expect(seen[seen.length - 1]).toBe(1);
  });

  it('reports once per user and removes for a moderator', async () => {
    const repo = createMockSoukChatRepository();
    const sent = await repo.sendMessage({ requestId: 'r1', authorId: 'u1', text: 'Hello there.' });
    if (!sent.ok) throw new Error('setup failed');
    await repo.reportMessage(sent.value.id, 'u2');
    const twice = await repo.reportMessage(sent.value.id, 'u2');
    if (twice.ok) expect(twice.value.reportedBy).toEqual(['u2']);
    const removed = await repo.removeMessage(sent.value.id, 'mod-1');
    expect(removed.ok).toBe(true);
    if (removed.ok) expect(removed.value.status).toBe('removed');
  });

  it('rejects empty and overlong messages', async () => {
    const repo = createMockSoukChatRepository();
    expect((await repo.sendMessage({ requestId: 'r1', authorId: 'u1', text: '  ' })).ok).toBe(false);
    expect(
      (await repo.sendMessage({ requestId: 'r1', authorId: 'u1', text: 'x'.repeat(501) })).ok,
    ).toBe(false);
  });
});
