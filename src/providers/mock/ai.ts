// In-memory AiProvider. Compliant with ADR-0006 (Advisory only).
// Returns a deterministic score from input factors, always marked advisory:true.
// Never rejects, approves, or blocks — that is not in the contract.

import type { Result } from '@/core/result';

import type { AiProvider, AiScoreInput, AiScoreOutput } from '../contracts/ai';
import type { HealthCheckResult } from '../types';
import { DEFAULT_MOCK_CONFIG, simulateMockIO, type MockProviderConfig } from './config';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function createMockAiProvider(
  config: MockProviderConfig = DEFAULT_MOCK_CONFIG,
): AiProvider {
  return Object.freeze({
    name: 'ai' as const,
    mode: 'mock' as const,
    capabilities: ['scoreEligibility'] as const,
    async healthCheck(): Promise<HealthCheckResult> {
      return { status: 'ok', checkedAt: Date.now() };
    },
    async scoreEligibility(input: AiScoreInput): Promise<Result<AiScoreOutput>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      const values = Object.values(input.factors);
      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      return {
        ok: true,
        value: {
          score: clamp(Math.round(avg), 0, 100),
          advisory: true,
          explanation: 'Deterministic mock score from factors. Advisory only.',
        },
      };
    },
  });
}
