// In-memory FileStorageProvider. Files are opaque URIs; no actual I/O.

import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';

import type { FileStorageProvider, FileUploadOptions, UploadedFile } from '../contracts/storage';
import type { HealthCheckResult } from '../types';
import { DEFAULT_MOCK_CONFIG, simulateMockIO, stableHash, type MockProviderConfig } from './config';

export interface MockStorageProvider extends FileStorageProvider {
  __list(): readonly UploadedFile[];
}

export function createMockStorageProvider(
  config: MockProviderConfig = DEFAULT_MOCK_CONFIG,
): MockStorageProvider {
  const files = new Map<string, UploadedFile>();

  return Object.freeze({
    name: 'storage' as const,
    mode: 'mock' as const,
    capabilities: ['uploadFile', 'deleteFile', 'getPublicUrl'] as const,
    async healthCheck(): Promise<HealthCheckResult> {
      return { status: 'ok', checkedAt: Date.now() };
    },
    async uploadFile(
      localUri: string,
      options?: FileUploadOptions,
    ): Promise<Result<UploadedFile>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      if (!localUri.trim()) {
        return { ok: false, error: AppError.validation({ code: 'EMPTY_URI' }) };
      }
      const id = `mock-file-${stableHash(localUri + Date.now())}`;
      const file: UploadedFile = Object.freeze({
        id,
        url: `memory://${id}`,
        size: localUri.length,
        contentType: options?.contentType ?? 'application/octet-stream',
        dataOrigin: 'demo' as const,
      });
      files.set(id, file);
      return { ok: true, value: file };
    },
    async deleteFile(fileId: string): Promise<Result<void>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      files.delete(fileId);
      return { ok: true, value: undefined };
    },
    async getPublicUrl(fileId: string): Promise<Result<string>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      const f = files.get(fileId);
      if (!f) return { ok: false, error: AppError.notFound({ code: 'FILE_NOT_FOUND' }) };
      return { ok: true, value: f.url };
    },
    __list(): readonly UploadedFile[] {
      return Array.from(files.values());
    },
  });
}
