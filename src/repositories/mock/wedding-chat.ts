import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  ChatListener,
  ChatMessage,
  ChatMute,
  SendChatMessageInput,
  WeddingChatRepository,
} from '../contracts/wedding-chat';
import type { MockRepositoryOptions } from './profile';

export function createMockWeddingChatRepository(
  options: MockRepositoryOptions = {},
): WeddingChatRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const messages = new Map<string, ChatMessage>();
  const mutes = new Map<string, ChatMute>();
  const listeners = new Map<string, Set<ChatListener>>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) await new Promise<void>((r) => setTimeout(r, delayMs));
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  function nextId(prefix: string): string {
    counter += 1;
    return `mock-${prefix}-${Date.now()}-${counter}`;
  }

  function snapshot(groupId: string): readonly ChatMessage[] {
    return Array.from(messages.values())
      .filter((m) => m.groupId === groupId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  function emit(groupId: string): void {
    const group = listeners.get(groupId);
    if (!group) return;
    const payload = snapshot(groupId);
    for (const listener of group) listener(payload);
  }

  return Object.freeze({
    async listMessages(groupId: string): Promise<Result<readonly ChatMessage[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(snapshot(groupId));
    },

    async sendMessage(input: SendChatMessageInput): Promise<Result<ChatMessage>> {
      const text = input.text.trim();
      if (!input.groupId || !input.authorId || text.length === 0 || text.length > 500) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_MESSAGE' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const now = new Date().toISOString();
      const message: ChatMessage = Object.freeze({
        id: nextId('wedding-message'),
        groupId: input.groupId,
        authorId: input.authorId,
        text,
        status: 'visible' as const,
        reportedBy: Object.freeze([]),
        removedBy: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      messages.set(message.id, message);
      emit(input.groupId);
      return ok(message);
    },

    async reportMessage(id: string, userId: string): Promise<Result<ChatMessage>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = messages.get(id);
      if (!existing) return { ok: false, error: AppError.notFound({ code: 'MESSAGE_NOT_FOUND' }) };
      if (existing.reportedBy.includes(userId)) return ok(existing);
      const updated: ChatMessage = Object.freeze({
        ...existing,
        status: existing.status === 'removed' ? 'removed' : ('reported' as const),
        reportedBy: Object.freeze([...existing.reportedBy, userId]),
        updatedAt: new Date().toISOString(),
      });
      messages.set(id, updated);
      emit(existing.groupId);
      return ok(updated);
    },

    async removeMessage(id: string, moderatorId: string): Promise<Result<ChatMessage>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = messages.get(id);
      if (!existing) return { ok: false, error: AppError.notFound({ code: 'MESSAGE_NOT_FOUND' }) };
      const updated: ChatMessage = Object.freeze({
        ...existing,
        status: 'removed' as const,
        removedBy: moderatorId,
        updatedAt: new Date().toISOString(),
      });
      messages.set(id, updated);
      emit(existing.groupId);
      return ok(updated);
    },

    async listMutes(groupId: string): Promise<Result<readonly ChatMute[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(mutes.values()).filter((m) => m.groupId === groupId));
    },

    async muteMember(
      groupId: string,
      userId: string,
      mutedBy: string,
      until?: string | null,
    ): Promise<Result<ChatMute>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const now = new Date().toISOString();
      for (const existing of mutes.values()) {
        if (existing.groupId === groupId && existing.userId === userId) {
          const updated: ChatMute = Object.freeze({
            ...existing,
            mutedBy,
            until: until ?? null,
            updatedAt: now,
          });
          mutes.set(existing.id, updated);
          return ok(updated);
        }
      }
      const mute: ChatMute = Object.freeze({
        id: nextId('wedding-mute'),
        groupId,
        userId,
        mutedBy,
        until: until ?? null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      mutes.set(mute.id, mute);
      return ok(mute);
    },

    async unmuteMember(groupId: string, userId: string): Promise<Result<void>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      for (const [key, mute] of mutes.entries()) {
        if (mute.groupId === groupId && mute.userId === userId) mutes.delete(key);
      }
      return ok(undefined);
    },

    async purgeOlderThan(groupId: string, cutoffIso: string): Promise<Result<number>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      let removed = 0;
      for (const [key, message] of messages.entries()) {
        if (message.groupId === groupId && message.createdAt < cutoffIso) {
          messages.delete(key);
          removed += 1;
        }
      }
      if (removed > 0) emit(groupId);
      return ok(removed);
    },

    subscribe(groupId: string, listener: ChatListener): () => void {
      const group = listeners.get(groupId) ?? new Set<ChatListener>();
      group.add(listener);
      listeners.set(groupId, group);
      listener(snapshot(groupId));
      return () => {
        const current = listeners.get(groupId);
        if (!current) return;
        current.delete(listener);
        if (current.size === 0) listeners.delete(groupId);
      };
    },
  });
}
