// FileStorageProvider contract. Backed by an in-memory map in demo, by Supabase Storage in backend (P18).

import type { Result } from '@/core/result';
import type { ProviderBase } from '../types';

export interface FileUploadOptions {
  readonly contentType?: string;
  /** Optional relative path hint. Ignored by mock adapters. */
  readonly path?: string;
}

export interface UploadedFile {
  readonly id: string;
  readonly url: string;
  readonly size: number;
  readonly contentType: string;
  readonly dataOrigin: 'real' | 'demo';
}

export interface FileStorageProvider extends ProviderBase {
  readonly name: 'storage';
  uploadFile(localUri: string, options?: FileUploadOptions): Promise<Result<UploadedFile>>;
  deleteFile(fileId: string): Promise<Result<void>>;
  getPublicUrl(fileId: string): Promise<Result<string>>;
}
