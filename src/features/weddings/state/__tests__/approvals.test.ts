import {
  agreementComplete,
  allApproved,
  bumpVersion,
  missingApprovals,
  requiredApprovals,
} from '../approvals';

describe('unanimous approvals', () => {
  const required = requiredApprovals(['a', 'b', 'c', 'a']);

  it('deduplicates the required members', () => {
    expect(required).toEqual(['a', 'b', 'c']);
  });

  it('is not adopted until everyone approves', () => {
    expect(allApproved(required, [{ userId: 'a', approved: true }])).toBe(false);
    expect(
      allApproved(required, [
        { userId: 'a', approved: true },
        { userId: 'b', approved: true },
        { userId: 'c', approved: false },
      ]),
    ).toBe(false);
    expect(
      allApproved(required, [
        { userId: 'a', approved: true },
        { userId: 'b', approved: true },
        { userId: 'c', approved: true },
      ]),
    ).toBe(true);
  });

  it('never adopts an empty group', () => {
    expect(allApproved([], [])).toBe(false);
    expect(agreementComplete([], [])).toBe(false);
  });

  it('lists who is still missing', () => {
    expect(missingApprovals(required, [{ userId: 'b', approved: true }])).toEqual(['a', 'c']);
  });

  it('bumps the version on every edit', () => {
    expect(bumpVersion(null)).toBe(1);
    expect(bumpVersion(undefined)).toBe(1);
    expect(bumpVersion(3)).toBe(4);
    expect(bumpVersion(-2)).toBe(1);
  });

  it('completes the agreement only when all acknowledge', () => {
    expect(agreementComplete(required, ['a', 'b'])).toBe(false);
    expect(agreementComplete(required, ['a', 'b', 'c'])).toBe(true);
  });
});
