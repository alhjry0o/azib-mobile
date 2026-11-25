// Repeat-listing flag. HONEST LIMIT: the P08 fingerprint is metadata-based
// (mimeType|size|name), so renaming a file evades it (PROJECT_CONTEXT #51).
// This module never claims content detection.
import type { SoukItem } from '@/repositories/contracts/souk';

export interface DuplicateProbe {
  readonly imageFingerprints: readonly string[];
  readonly title: string | null;
  readonly governorateId: string | null;
  readonly donorId: string | null;
}

export interface DuplicateResult {
  readonly flagged: boolean;
  readonly matchedItemId: string | null;
  readonly reasonKey: string | null;
  readonly basis: 'fingerprint' | 'title_area' | 'none';
}

function normalise(value: string | null): string {
  return (value ?? '').trim().toLowerCase();
}

export function detectDuplicate(
  probe: DuplicateProbe,
  existing: readonly SoukItem[],
): DuplicateResult {
  const probes = new Set(probe.imageFingerprints);
  for (const item of existing) {
    const fingerprints = item.imageFingerprints ?? [];
    if (fingerprints.some((f) => probes.has(f))) {
      return Object.freeze({
        flagged: true,
        matchedItemId: item.id,
        reasonKey: 'marketplace:souk.duplicate.fingerprint',
        basis: 'fingerprint' as const,
      });
    }
  }
  const title = normalise(probe.title);
  if (title.length > 0) {
    for (const item of existing) {
      if (normalise(item.title ?? null) !== title) continue;
      if ((item.governorateId ?? null) !== probe.governorateId) continue;
      if ((item.donorId ?? null) !== probe.donorId) continue;
      return Object.freeze({
        flagged: true,
        matchedItemId: item.id,
        reasonKey: 'marketplace:souk.duplicate.titleArea',
        basis: 'title_area' as const,
      });
    }
  }
  return Object.freeze({
    flagged: false,
    matchedItemId: null,
    reasonKey: null,
    basis: 'none' as const,
  });
}
