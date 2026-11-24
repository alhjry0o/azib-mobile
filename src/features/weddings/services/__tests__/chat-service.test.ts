import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockNotificationRepository } from '@/repositories/mock/notification';
import { createMockWeddingRepository } from '@/repositories/mock/wedding';
import { createMockWeddingChatRepository } from '@/repositories/mock/wedding-chat';
import { createMockWeddingGroupRepository } from '@/repositories/mock/wedding-group';
import { createGroup } from '../group-service';
import {
  muteChatMember,
  removeChatMessage,
  sendChatMessage,
  unmuteChatMember,
} from '../chat-service';

const NOW = new Date('2026-06-01T00:00:00.000Z');

async function setup() {
  const deps = {
    chat: createMockWeddingChatRepository(),
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
  return { deps, groupId: group.value.id };
}

describe('chat service enforcement', () => {
  it('lets an unmuted active member send plain text', async () => {
    const { deps, groupId } = await setup();
    const sent = await sendChatMessage(deps, groupId, 'organizer-1', 'Hall booked', NOW);
    expect(sent.ok).toBe(true);
  });

  it('blocks phone numbers, links and images before persisting', async () => {
    const { deps, groupId } = await setup();
    for (const text of ['call 771234567', 'https://example.com', 'photo.jpg']) {
      const result = await sendChatMessage(deps, groupId, 'organizer-1', text, NOW);
      expect(result.ok).toBe(false);
    }
    const listed = await deps.chat.listMessages(groupId);
    if (listed.ok) expect(listed.value.length).toBe(0);
  });

  it('blocks non-members and muted members', async () => {
    const { deps, groupId } = await setup();
    const outsider = await sendChatMessage(deps, groupId, 'nobody', 'hello', NOW);
    expect(outsider.ok).toBe(false);

    await deps.groups.addMember({
      groupId,
      userId: 'member-2',
      displayNameConsent: true,
    });
    await muteChatMember(deps, groupId, 'member-2', 'organizer-1', null);
    const muted = await sendChatMessage(deps, groupId, 'member-2', 'hello', NOW);
    expect(muted.ok).toBe(false);

    await unmuteChatMember(deps, groupId, 'member-2', 'organizer-1');
    const unmuted = await sendChatMessage(deps, groupId, 'member-2', 'hello', NOW);
    expect(unmuted.ok).toBe(true);
  });

  it('enforces the rate limit', async () => {
    const { deps, groupId } = await setup();
    for (let i = 0; i < 5; i += 1) {
      await sendChatMessage(deps, groupId, 'organizer-1', `msg ${i}`, new Date());
    }
    // The repository stamps createdAt with the real clock, so the rate window
    // must be evaluated on that same clock — never on the fixed past NOW.
    const stored = await deps.chat.listMessages(groupId);
    if (!stored.ok) throw new Error('setup failed');
    const last = stored.value[stored.value.length - 1];
    const now = last ? new Date(last.createdAt) : new Date();
    const sixth = await sendChatMessage(deps, groupId, 'organizer-1', 'msg 6', now);
    expect(sixth.ok).toBe(false);
    if (!sixth.ok) expect(sixth.error.meta.code).toBe('CHAT_RATE_LIMITED');
  });

  it('only the organizer removes messages', async () => {
    const { deps, groupId } = await setup();
    const sent = await sendChatMessage(deps, groupId, 'organizer-1', 'hello', NOW);
    if (!sent.ok) throw new Error('setup failed');
    await deps.groups.addMember({ groupId, userId: 'member-2', displayNameConsent: true });
    const denied = await removeChatMessage(deps, groupId, sent.value.id, 'member-2');
    expect(denied.ok).toBe(false);
    const removed = await removeChatMessage(deps, groupId, sent.value.id, 'organizer-1');
    expect(removed.ok).toBe(true);
  });
});
