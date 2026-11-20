export * from './engine';
export * from './state-machine';
export type { DedupProbe, DedupService } from './services/dedup-service';
export { createMockDedupService } from './services/dedup-service';
export { fingerprint, sha256Hex } from './services/hash';
export type { AuditEventInput } from './services/audit-trail';
export { appendApplicationAudit } from './services/audit-trail';
export type { TransitionParams, WorkflowDeps } from './services/workflow-service';
export { applyTransition } from './services/workflow-service';
