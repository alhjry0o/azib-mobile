// ContentProvider contract. Backed by static in-memory content in demo, by Supabase in backend (P15).
//
// Content is *referenced by i18n keys*, not by literal text.
// This avoids duplicating Arabic text between JSON and DB rows.

import type { Result } from '@/core/result';
import type { ProviderBase } from '../types';

export type ContentBlockKind = 'text' | 'rich-text' | 'image';

export interface ContentBlock {
  readonly id: string;
  readonly kind: ContentBlockKind;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface ContentArticle {
  readonly id: string;
  readonly slug: string;
  /** i18n key for the title (not literal text). */
  readonly titleKey: string;
  /** i18n key for the body (not literal text). */
  readonly bodyKey: string;
  readonly blocks?: readonly ContentBlock;
}

export interface ContentProvider extends ProviderBase {
  readonly name: 'content';
  getArticleBySlug(slug: string): Promise<Result<ContentArticle | null>>;
  listArticles(): Promise<Result<readonly ContentArticle>>;
}
