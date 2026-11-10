// EmailProvider contract. Backed by a console log in demo, by Supabase Edge Function + SMTP in backend (P06).

import type { Result } from '@/core/result';
import type { ProviderBase } from '../types';

export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly body: string;
  readonly htmlBody?: string;
}

export interface EmailProvider extends ProviderBase {
  readonly name: 'email';
  send(message: EmailMessage): Promise<Result<{ id: string }>>;
}
