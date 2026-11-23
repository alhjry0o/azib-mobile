import type { Result } from '@/core/result';
import type { BaseEntity } from '../types';

export type ChatMessageStatus = 'visible' | 'reported' | 'removed';

export interface ChatMessage extends BaseEntity {
  readonly groupId: string;
  readonly authorId: string;
  readonly text: string;
  readonly status: ChatMessageStatus;
  readonly reportedBy: readonly string[];
  readonly removedBy?: string | null;
}

export interface ChatMute extends BaseEntity {
  readonly groupId: string;
  readonly userId: string;
  readonly mutedBy: string;
  readonly until?: string | null;
}

export interface SendChatMessageInput {
  readonly groupId: string;
  readonly authorId: string;
  readonly text: string;
}

export type ChatListener = (messages: readonly ChatMessage[]) => void;

export interface WeddingChatRepository {
  listMessages(groupId: string): Promise<Result<readonly ChatMessage[]>>;
  sendMessage(input: SendChatMessageInput): Promise<Result<ChatMessage>>;
  reportMessage(id: string, userId: string): Promise<Result<ChatMessage>>;
  removeMessage(id: string, moderatorId: string): Promise<Result<ChatMessage>>;
  listMutes(groupId: string): Promise<Result<readonly ChatMute[]>>;
  muteMember(
    groupId: string,
    userId: string,
    mutedBy: string,
    until?: string | null,
  ): Promise<Result<ChatMute>>;
  unmuteMember(groupId: string, userId: string): Promise<Result<void>>;
  /** Retention: drop messages older than the cutoff. Returns removed count. */
  purgeOlderThan(groupId: string, cutoffIso: string): Promise<Result<number>>;
  /**
   * Local realtime bus (D-3). No 13th provider: adding one would break the
   * NotConnected contract test that matches ALL_PROVIDER_NAMES exactly.
   * Returns an unsubscribe function.
   */
  subscribe(groupId: string, listener: ChatListener): () => void;
}
