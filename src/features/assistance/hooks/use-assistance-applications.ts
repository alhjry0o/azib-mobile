import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { Application } from '@/repositories/contracts/application';
import { useProviderContainer } from '@/providers';
import { useAuth } from '@/features/auth';
import type { AppMode } from '@/stores';

export function myApplicationsQueryKey(mode: AppMode, userId: string | null) {
  return ['assistance', 'mine', mode, userId] as const;
}
export function applicationQueryKey(mode: AppMode, id: string) {
  return ['assistance', 'application', mode, id] as const;
}
export function timelineQueryKey(mode: AppMode, id: string) {
  return ['assistance', 'timeline', mode, id] as const;
}

export interface MyApplicationsApi {
  readonly applications: readonly Application[];
  readonly isLoading: boolean;
  readonly error: AppError | null;
  refetch(): void;
}

export function useMyApplications(): MyApplicationsApi {
  const container = useProviderContainer();
  const auth = useAuth();
  const userId = auth.user?.id ?? null;
  const query = useQuery({
    queryKey: myApplicationsQueryKey(container.mode, userId),
    enabled: container.mode === 'demo' && userId !== null,
    staleTime: 15_000,
    queryFn: async (): Promise<Result<readonly Application[]>> => {
      if (!userId) return { ok: true, value: [] };
      return container.repositories.applications.listByApplicant(userId);
    },
  });
  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);
  return {
    applications: query.data?.ok ? query.data.value : [],
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    refetch,
  };
}

export interface ApplicationDetail {
  readonly application: Application | null;
  readonly programNameKey: string | null;
  readonly forbidden: boolean;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  refetch(): void;
}

interface DetailPayload {
  readonly application: Application | null;
  readonly programNameKey: string | null;
  readonly forbidden: boolean;
}

export function useApplicationDetail(id: string): ApplicationDetail {
  const container = useProviderContainer();
  const auth = useAuth();
  const userId = auth.user?.id ?? null;
  const query = useQuery({
    queryKey: applicationQueryKey(container.mode, id),
    enabled: container.mode === 'demo' && userId !== null && id.length > 0,
    staleTime: 10_000,
    queryFn: async (): Promise<Result<DetailPayload>> => {
      const found = await container.repositories.applications.getById(id);
      if (!found.ok) return found;
      const application = found.value;
      if (!application) {
        return { ok: true, value: { application: null, programNameKey: null, forbidden: false } };
      }
      if (application.applicantId !== userId) {
        return { ok: true, value: { application: null, programNameKey: null, forbidden: true } };
      }
      const program = await container.repositories.programs.getById(application.programId);
      return {
        ok: true,
        value: {
          application,
          programNameKey: program.ok && program.value ? program.value.nameKey : null,
          forbidden: false,
        },
      };
    },
  });
  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);
  const value = query.data?.ok ? query.data.value : null;
  return {
    application: value?.application ?? null,
    programNameKey: value?.programNameKey ?? null,
    forbidden: value?.forbidden === true,
    isLoading: query.isLoading,
    error: query.data && !query.data.ok ? query.data.error : null,
    refetch,
  };
}

export interface TimelineEntry {
  readonly id: string;
  readonly status: string;
  readonly at: string;
}

export interface TimelineApi {
  readonly entries: readonly TimelineEntry[];
  readonly isLoading: boolean;
  refetch(): void;
}

/**
 * AuditRepository has no target filter, so we filter client-side.
 * Server-side filtering arrives with the Supabase adapter (P18).
 */
export function useApplicationTimeline(id: string): TimelineApi {
  const container = useProviderContainer();
  const query = useQuery({
    queryKey: timelineQueryKey(container.mode, id),
    enabled: container.mode === 'demo' && id.length > 0,
    staleTime: 10_000,
    queryFn: async (): Promise<Result<readonly TimelineEntry[]>> => {
      const listed = await container.repositories.audit.list({ limit: 200 });
      if (!listed.ok) return listed;
      const entries: TimelineEntry[] = [];
      for (const entry of listed.value.items) {
        if (entry.meta.applicationId !== id) continue;
        const status = typeof entry.meta.to === 'string' ? entry.meta.to : null;
        if (!status) continue;
        entries.push({ id: entry.id, status, at: entry.createdAt });
      }
      entries.sort((a, b) => a.at.localeCompare(b.at));
      return { ok: true, value: entries };
    },
  });
  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);
  return {
    entries: query.data?.ok ? query.data.value : [],
    isLoading: query.isLoading,
    refetch,
  };
}
