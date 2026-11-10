// Shared configuration for mock adapters.
// Tests can set delayMs > 0 to simulate latency, or forceError to test failure paths.

import { AppError } from '@/core/errors';
import type { AppErrorKind } from '@/core/errors';

export interface MockProviderConfig {
  /** Simulated latency in ms. Default 0 (instant). */
  readonly delayMs: number;
  /** When set, every call fails with this AppError kind. Default null. */
  readonly forceError: AppErrorKind | null;
}

export const DEFAULT_MOCK_CONFIG: MockProviderConfig = Object.freeze({
  delayMs: 0,
  forceError: null,
});

export function withConfig(partial: Partial<MockProviderConfig> = {}): MockProviderConfig {
  return Object.freeze({
    delayMs: partial.delayMs ?? DEFAULT_MOCK_CONFIG.delayMs,
    forceError: partial.forceError ?? DEFAULT_MOCK_CONFIG.forceError,
  });
}

/**
 * Returns an AppError to fail the call when forceError is set.
 * Otherwise awaits delayMs (if > 0) and returns null.
 */
export async function simulateMockIO(config: MockProviderConfig): Promise<AppError | null> {
  if (config.delayMs > 0) {
    await new Promise<void>((resolve) => setTimeout(resolve, config.delayMs));
  }
  if (config.forceError !== null) {
    return AppError.fromKind(config.forceError, { code: 'MOCK_FORCED_ERROR' });
  }
  return null;
}

/** Deterministic 32-bit hash for stable demo ids. */
export function stableHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}
