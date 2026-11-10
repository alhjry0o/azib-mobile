// In-memory ContentProvider. Articles use i18n keys, not literal text.
// Empty by default; seed populates in Part 5.

import type { Result } from '@/core/result';

import type { ContentArticle, ContentProvider } from '../contracts/content';
import type { HealthCheckResult } from '../types';
import { DEFAULT_MOCK_CONFIG, simulateMockIO, type MockProviderConfig } from './config';

export function createMockContentProvider(
  config: MockProviderConfig = DEFAULT_MOCK_CONFIG,
  articles: readonly ContentArticle[] = [],
): ContentProvider {
  const bySlug = new Map(articles.map((a) => [a.slug, a]));

  return Object.freeze({
    name: 'content' as const,
    mode: 'mock' as const,
    capabilities: ['getArticleBySlug', 'listArticles'] as const,
    async healthCheck(): Promise<HealthCheckResult> {
      return { status: 'ok', checkedAt: Date.now() };
    },
    async getArticleBySlug(slug: string): Promise<Result<ContentArticle | null>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      return { ok: true, value: bySlug.get(slug) ?? null };
    },
    async listArticles(): Promise<Result<readonly ContentArticle[]>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      return { ok: true, value: Array.from(bySlug.values()) };
    },
  });
}
