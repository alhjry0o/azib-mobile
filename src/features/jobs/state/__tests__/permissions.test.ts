import {
  canJob,
  canManageOwnJob,
  canViewApplicantCv,
  canViewApplicants,
} from '../index';

describe('job permissions', () => {
  it('guests only browse', () => {
    expect(canJob('guest', 'browse_jobs')).toBe(true);
    expect(canJob('guest', 'apply_job')).toBe(false);
    expect(canJob('guest', 'view_applicants')).toBe(false);
  });

  it('members may apply and publish, moderators review', () => {
    expect(canJob('member', 'apply_job')).toBe(true);
    expect(canJob('member', 'publish_job')).toBe(true);
    expect(canJob('member', 'review_job')).toBe(false);
    expect(canJob('moderator', 'review_job')).toBe(true);
    expect(canJob('moderator', 'apply_job')).toBe(false);
    expect(canJob('auditor', 'view_applicant_cv')).toBe(false);
  });

  it('applicants and CV require being the CONCERNED publisher', () => {
    expect(canViewApplicants('member', true)).toBe(true);
    expect(canViewApplicants('member', false)).toBe(false);
    expect(canViewApplicantCv('member', true)).toBe(true);
    expect(canViewApplicantCv('member', false)).toBe(false);
    expect(canViewApplicantCv('moderator', true)).toBe(false);
    expect(canManageOwnJob('member', false)).toBe(false);
    expect(canManageOwnJob('admin', true)).toBe(true);
  });
});
