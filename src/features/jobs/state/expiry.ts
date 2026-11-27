import type { JobStatus } from '@/repositories/contracts/job';

const DAY_MS = 24 * 60 * 60 * 1000;

export type JobVisibility = 'live' | 'closed' | 'expired' | 'not_published';

export interface JobValidity {
  readonly status: JobStatus;
  readonly expiresAt?: string | null;
  readonly deadline?: string | null;
}

export function jobExpiryFrom(publishedAt: string, expiryDays: number): string | null {
  const stamp = Date.parse(publishedAt);
  if (Number.isNaN(stamp) || !Number.isFinite(expiryDays) || expiryDays <= 0) return null;
  return new Date(stamp + expiryDays * DAY_MS).toISOString();
}

export function isJobExpired(job: Pick<JobValidity, 'expiresAt'>, now: Date): boolean {
  const raw = job.expiresAt ?? null;
  if (!raw) return false;
  const stamp = Date.parse(raw);
  if (Number.isNaN(stamp)) return false;
  return stamp <= now.getTime();
}

export function isPastDeadline(job: Pick<JobValidity, 'deadline'>, now: Date): boolean {
  const raw = job.deadline ?? null;
  if (!raw) return false;
  const stamp = Date.parse(raw);
  if (Number.isNaN(stamp)) return false;
  return stamp <= now.getTime();
}

export function jobVisibility(job: JobValidity, now: Date): JobVisibility {
  if (job.status !== 'open') {
    return job.status === 'closed' ? 'closed' : 'not_published';
  }
  if (isJobExpired(job, now)) return 'expired';
  return 'live';
}

export function isAcceptingApplications(job: JobValidity, now: Date): boolean {
  return jobVisibility(job, now) === 'live' && !isPastDeadline(job, now);
}

export function daysRemaining(raw: string | null | undefined, now: Date): number | null {
  if (!raw) return null;
  const stamp = Date.parse(raw);
  if (Number.isNaN(stamp)) return null;
  return Math.max(0, Math.floor((stamp - now.getTime()) / DAY_MS));
}
