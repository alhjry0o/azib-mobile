// AiProvider contract. Compliant with ADR-0006 (Advisory only).
//
// The single allowed method returns a score marked `advisory: true`.
// No method can reject, approve, or block a request. Human review is mandatory.

import type { Result } from '@/core/result';
import type { ProviderBase } from '../types';

export interface AiScoreInput {
  readonly factors: Readonly<Record<string, number>>;
}

export interface AiScoreOutput {
  /** 0..100. Advisory only — never decisive. */
  readonly score: number;
  readonly advisory: true;
  readonly explanation?: string;
}

export interface AiProvider extends ProviderBase {
  readonly name: 'ai';
  scoreEligibility(input: AiScoreInput): Promise<Result<AiScoreOutput>>;
}
