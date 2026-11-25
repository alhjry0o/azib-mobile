import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  SendSoukMessageInput,
  SoukChatListener,
  SoukChatMessage,
  SoukChatRepository,
} from '../contracts/souk-chat';
import type { MockRepositoryOptions } from './profile';

export function createMockSoukChatRepository(
  options: MockRepositoryOptions = {},
): SoukChatRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const messages = new Map<string, SoukChatMessage>();
  const listeners = new Map<string, Set<SoukChatListener>>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) await new Promise<void>((r) => setTimeout(r, delayMs));
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  function snapshot(requestId: string): readonly SoukChatMessage[] {
    return Array.from(messages.values())
      .filter((m) => m.requestId === requestId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  function emit(requestId: string): void {
    const group = listeners.get(requestId);
    if (!group) return;
    const payload = snapshot(requestId);
    for (const listener of group) listener(payload);
  }

  return Object.freeze({
    async listMessages(requestId: string): Promise<Result<readonly SoukChatMessage[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(snapshot(requestId));
    },

    async sendMessage(input: SendSoukMessageInput): Promise<Result<SoukChatMessage>> {
      const text = input.text.trim();
      if (!input.requestId || !input.authorId || text.length === 0 || text.length > 500) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_MESSAGE' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      counter += 1;
      const now = new Date().toISOString();
      const message: SoukChatMessage = Object.freeze({
        id: `mock-souk-message-${Date.now()}-${counter}`,
        requestId: input.requestId,
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
      emit(input.requestId);
      return ok(message);
    },

    async reportMessage(id: string, userId: string): Promise<Result<SoukChatMessage>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = messages.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'MESSAGE_NOT_FOUND' }) };
      }
      if (existing.reportedBy.includes(userId)) return ok(existing);
      const updated: SoukChatMessage = Object.freeze({
        ...existing,
        status: existing.status === 'removed' ? 'removed' : ('reported' as const),
        reportedBy: Object.freeze([...existing.reportedBy, userId]),
        updatedAt: new Date().toISOString(),
      });
      messages.set(id, updated);
      emit(existing.requestId);
      return ok(updated);
    },

    async removeMessage(id: string, moderatorId: string): Promise<Result<SoukChatMessage>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = messages.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'MESSAGE_NOT_FOUND' }) };
      }
      const updated: SoukChatMessage = Object.freeze({
        ...existing,
        status: 'removed' as const,
        removedBy: moderatorId,
        updatedAt: new Date().toISOString(),
      });
      messages.set(id, updated);
      emit(existing.requestId);
      return ok(updated);
    },

    subscribe(requestId: string, listener: SoukChatListener): () => void {
      const group = listeners.get(requestId) ?? new Set<SoukChatListener>();
      group.add(listener);
      listeners.set(requestId, group);
      listener(snapshot(requestId));
      return () => {
        const current = listeners.get(requestId);
        if (!current) return;
        current.delete(listener);
        if (current.size === 0) listeners.delete(requestId);
      };
    },
  });
}
