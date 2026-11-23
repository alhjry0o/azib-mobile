// Unanimous share approval per budget version; any edit resets approvals.
export interface ApprovalRecord {
  readonly userId: string;
  readonly approved: boolean;
}

export function requiredApprovals(activeMemberIds: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of activeMemberIds) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function allApproved(
  required: readonly string[],
  approvals: readonly ApprovalRecord[],
): boolean {
  if (required.length === 0) return false;
  return required.every((userId) =>
    approvals.some((a) => a.userId === userId && a.approved),
  );
}

export function missingApprovals(
  required: readonly string[],
  approvals: readonly ApprovalRecord[],
): readonly string[] {
  return required.filter(
    (userId) => !approvals.some((a) => a.userId === userId && a.approved),
  );
}

/** Any content edit issues a NEW version; approvals never carry over. */
export function bumpVersion(current: number | null | undefined): number {
  const base = current ?? 0;
  return Number.isInteger(base) && base >= 0 ? base + 1 : 1;
}

export function agreementComplete(
  required: readonly string[],
  acknowledgements: readonly string[],
): boolean {
  if (required.length === 0) return false;
  return required.every((userId) => acknowledgements.includes(userId));
}
