import type { Result } from '@/core/result';
import type { BaseEntity } from '../types';

export type SoukChatStatus = 'visible' | 'reported' | 'removed';

export interface SoukChatMessage extends BaseEntity {
  readonly requestId: string;
  readonly authorId: string;
  readonly text: string;
  readonly status: SoukChatStatus;
  readonly reportedBy: readonly string[];
  readonly removedBy?: string | null;
}

export interface SendSoukMessageInput {
  readonly requestId: string;
  readonly authorId: string;
  readonly text: string;
}

export type SoukChatListener = (messages: readonly SoukChatMessage[]) => void;

export interface SoukChatRepository {
  listMessages(requestId: string): Promise<Result<readonly SoukChatMessage[]>>;
  sendMessage(input: SendSoukMessageInput): Promise<Result<SoukChatMessage>>;
  reportMessage(id: string, userId: string): Promise<Result<SoukChatMessage>>;
  removeMessage(id: string, moderatorId: string): Promise<Result<SoukChatMessage>>;
  /**
   * Local realtime bus (ADR-0041 pattern). No 13th provider.
   * Returns an unsubscribe function.
   */
  subscribe(requestId: string, listener: SoukChatListener): () => void;
}
