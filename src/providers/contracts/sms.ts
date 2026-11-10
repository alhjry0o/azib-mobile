// SmsProvider contract. Backed by a console log in demo, by an external SMS gateway in backend (P06).

import type { Result } from '@/core/result';
import type { ProviderBase } from '../types';

export interface SmsMessage {
  readonly to: string;
  readonly body: string;
}

export interface SmsProvider extends ProviderBase {
  readonly name: 'sms';
  send(message: SmsMessage): Promise<Result<{ id: string }>>;
}
