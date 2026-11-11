import type { SeedAuditEntry } from './types';

export const seedAudit: readonly SeedAuditEntry[] = [
  {
    actorId: 'seed-user-1',
    action: 'application.submitted',
    target: 'seed-application-1',
    meta: { source: 'demo' },
  },
  {
    actorId: 'seed-user-2',
    action: 'application.submitted',
    target: 'seed-application-2',
    meta: { source: 'demo' },
  },
  {
    actorId: 'seed-user-3',
    action: 'reviewer.decision',
    target: 'seed-application-1',
    meta: { decision: 'advisory_only' },
  },
];
