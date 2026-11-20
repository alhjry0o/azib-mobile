// DedupService interface + Mock implementation (D-9).
// Fingerprints are pseudonymous; raw identifiers are never persisted or logged.
// The authoritative HMAC check runs inside an Edge Function in P18.
import type { Application } from '@/repositories/contracts/application';
import type { DedupSignals } from '../engine/flags';
import { EMPTY_DEDUP_SIGNALS } from '../engine/flags';

export interface DedupProbe {
  readonly applicantId: string;
  readonly identityHash: string;
  readonly phoneHash: string;
  readonly documentHashes: readonly string[];
  readonly now?: Date;
}

export interface DedupService {
  readonly id: string;
  inspect(
    probe: DedupProbe,
    existing: readonly Application[],
    windowDays: number,
  ): Promise<DedupSignals>;
}

function withinWindow(iso: string | null | undefined, now: number, windowDays: number): boolean {
  if (!iso) return false;
  const stamp = Date.parse(iso);
  if (Number.isNaN(stamp)) return false;
  return now - stamp <= windowDays * 24 * 60 * 60 * 1000;
}

export function createMockDedupService(): DedupService {
  return Object.freeze({
    id: 'mock-dedup',
    async inspect(
      probe: DedupProbe,
      existing: readonly Application[],
      windowDays: number,
    ): Promise<DedupSignals> {
      const now = (probe.now ?? new Date()).getTime();
      let identityDuplicate = false;
      let phoneDuplicate = false;
      let documentReused = false;
      let recentSubmissionCount = 0;

      const probeDocs = new Set(probe.documentHashes);

      for (const application of existing) {
        const payload = application.payload;
        const isSameApplicant = application.applicantId === probe.applicantId;
        if (isSameApplicant && withinWindow(application.submittedAt, now, windowDays)) {
          recentSubmissionCount += 1;
        }
        if (!payload) continue;
        // A different applicant reusing the same identity/phone is the signal.
        if (!isSameApplicant && payload.applicant.identityHash === probe.identityHash) {
          identityDuplicate = true;
        }
        if (!isSameApplicant && payload.applicant.phoneHash === probe.phoneHash) {
          phoneDuplicate = true;
        }
        for (const document of payload.documents) {
          if (probeDocs.has(document.sha256)) {
            documentReused = true;
            break;
          }
        }
      }

      return Object.freeze({
        ...EMPTY_DEDUP_SIGNALS,
        identityDuplicate,
        phoneDuplicate,
        documentReused,
        recentSubmissionCount,
      });
    },
  });
}
