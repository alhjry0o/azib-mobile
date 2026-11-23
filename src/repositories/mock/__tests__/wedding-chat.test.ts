import { createMockWeddingChatRepository } from '../wedding-chat';

describe('MockWeddingChatRepository', () => {
  it('delivers messages to subscribers and stops after unsubscribe', async () => {
    const repo = createMockWeddingChatRepository();
    const seen: number[] = [];
    const unsubscribe = repo.subscribe('g1', (messages) => seen.push(messages.length));
    expect(seen).toEqual([0]);
    await repo.sendMessage({ groupId: 'g1', authorId: 'u1', text: 'first' });
    expect(seen[seen.length - 1]).toBe(1);
    unsubscribe();
    await repo.sendMessage({ groupId: 'g1', authorId: 'u1', text: 'second' });
    expect(seen[seen.length - 1]).toBe(1);
  });

  it('rejects empty and overlong messages', async () => {
    const repo = createMockWeddingChatRepository();
    expect((await repo.sendMessage({ groupId: 'g1', authorId: 'u1', text: '  ' })).ok).toBe(false);
    expect(
      (await repo.sendMessage({ groupId: 'g1', authorId: 'u1', text: 'x'.repeat(501) })).ok,
    ).toBe(false);
  });

  it('reports once per user and lets a moderator remove', async () => {
    const repo = createMockWeddingChatRepository();
    const sent = await repo.sendMessage({ groupId: 'g1', authorId: 'u1', text: 'hello' });
    if (!sent.ok) throw new Error('setup failed');
    await repo.reportMessage(sent.value.id, 'u2');
    const twice = await repo.reportMessage(sent.value.id, 'u2');
    if (twice.ok) expect(twice.value.reportedBy).toEqual(['u2']);
    const removed = await repo.removeMessage(sent.value.id, 'organizer');
    expect(removed.ok).toBe(true);
    if (removed.ok) expect(removed.value.status).toBe('removed');
  });

  it('mutes, unmutes and purges old messages', async () => {
    const repo = createMockWeddingChatRepository();
    await repo.muteMember('g1', 'u2', 'organizer', null);
    const mutes = await repo.listMutes('g1');
    if (mutes.ok) expect(mutes.value.length).toBe(1);
    await repo.unmuteMember('g1', 'u2');
    const after = await repo.listMutes('g1');
    if (after.ok) expect(after.value.length).toBe(0);

    await repo.sendMessage({ groupId: 'g1', authorId: 'u1', text: 'recent' });
    const purged = await repo.purgeOlderThan('g1', '2000-01-01T00:00:00.000Z');
    expect(purged.ok).toBe(true);
    if (purged.ok) expect(purged.value).toBe(0);
    const purgedAll = await repo.purgeOlderThan('g1', '2099-01-01T00:00:00.000Z');
    if (purgedAll.ok) expect(purgedAll.value).toBe(1);
  });
});
