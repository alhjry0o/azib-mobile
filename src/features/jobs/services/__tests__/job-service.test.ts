import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockJobRepository } from '@/repositories/mock/job';
import {
  closeJob,
  createJobDraft,
  expireJob,
  publishJob,
  relistJob,
  reopenJob,
  reviewJob,
} from '../job-service';
import { DEFAULT_JOB_LIMITS, resolveJobLimits } from '../../state/limits';

function setup() {
  return { jobs: createMockJobRepository(), audit: createMockAuditRepository() };
}

const input = {
  publisherId: 'publisher-1',
  publisherName: 'Demo publisher',
  title: 'Shop assistant',
  category: 'retail',
  description: 'A demo retail role with clearly fabricated details for testing.',
  governorateId: 'sanaa',
  districtId: null,
  workType: 'daily' as const,
  schedule: 'part_time' as const,
  salaryMin: 40000,
  salaryMax: 60000,
  requirements: [],
  applicationMethod: 'in_app' as const,
  applicationInstructions: null,
  deadline: null,
  publisherTermsAccepted: true,
};

describe('job service', () => {
  it('creates a draft with publisher terms and no verified flag', async () => {
    const deps = setup();
    const created = await createJobDraft(deps, input, DEFAULT_JOB_LIMITS, new Date());
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.value.status).toBe('draft');
    expect(created.value.publisherTermsAcceptedAt).toBeTruthy();
    expect(Object.keys(created.value)).not.toContain('verified');
  });

  it('publishes directly and sets expiry', async () => {
    const deps = setup();
    const now = new Date('2026-06-01T00:00:00.000Z');
    const created = await createJobDraft(deps, input, DEFAULT_JOB_LIMITS, now);
    if (!created.ok) throw new Error('setup failed');
    const published = await publishJob(
      deps,
      created.value.id,
      'publisher-1',
      false,
      DEFAULT_JOB_LIMITS,
      now,
    );
    expect(published.ok).toBe(true);
    if (published.ok) {
      expect(published.value.status).toBe('open');
      expect(published.value.expiresAt).toBe('2026-07-01T00:00:00.000Z');
    }
  });

  it('routes through review when required and refuses non-moderators', async () => {
    const deps = setup();
    const now = new Date();
    const created = await createJobDraft(deps, input, DEFAULT_JOB_LIMITS, now);
    if (!created.ok) throw new Error('setup failed');
    const submitted = await publishJob(
      deps,
      created.value.id,
      'publisher-1',
      true,
      DEFAULT_JOB_LIMITS,
      now,
    );
    expect(submitted.ok).toBe(true);
    if (submitted.ok) expect(submitted.value.status).toBe('pending_review');

    const denied = await reviewJob(
      deps,
      created.value.id,
      'member',
      'someone',
      'open',
      DEFAULT_JOB_LIMITS,
      now,
    );
    expect(denied.ok).toBe(false);
    const approved = await reviewJob(
      deps,
      created.value.id,
      'moderator',
      'mod-1',
      'open',
      DEFAULT_JOB_LIMITS,
      now,
    );
    expect(approved.ok).toBe(true);
  });

  it('rejects contact data in the description', async () => {
    const deps = setup();
    const result = await createJobDraft(
      deps,
      { ...input, description: 'Call me on 771234567 to arrange an interview quickly.' },
      DEFAULT_JOB_LIMITS,
      new Date(),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('JOB_CONTACT_IN_TEXT');
  });

  it('enforces the publish rate with a storage-aligned clock', async () => {
    const deps = setup();
    for (let i = 0; i < DEFAULT_JOB_LIMITS.publishRate.maxMessages; i += 1) {
      const created = await createJobDraft(
        deps,
        { ...input, title: `Role number ${i}` },
        DEFAULT_JOB_LIMITS,
        new Date(),
      );
      expect(created.ok).toBe(true);
    }
    const blocked = await createJobDraft(
      deps,
      { ...input, title: 'One more role' },
      DEFAULT_JOB_LIMITS,
      new Date(),
    );
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error.meta.code).toBe('JOB_RATE_LIMITED');
  });

  it('closes, reopens, expires by system and relists', async () => {
    const deps = setup();
    const limits = resolveJobLimits({ jobExpiryDays: 30 });
    const now = new Date('2026-06-01T00:00:00.000Z');
    const created = await createJobDraft(deps, input, limits, now);
    if (!created.ok) throw new Error('setup failed');
    await publishJob(deps, created.value.id, 'publisher-1', false, limits, now);
    const closed = await closeJob(deps, created.value.id, 'publisher-1');
    expect(closed.ok).toBe(true);
    const reopened = await reopenJob(deps, created.value.id, 'publisher-1', limits, now);
    expect(reopened.ok).toBe(true);
    const expired = await expireJob(deps, created.value.id, 'system-1');
    expect(expired.ok).toBe(true);
    const relisted = await relistJob(deps, created.value.id, 'publisher-1');
    expect(relisted.ok).toBe(true);
    if (relisted.ok) {
      expect(relisted.value.status).toBe('draft');
      expect(relisted.value.expiresAt).toBeNull();
    }
  });

  it('refuses a non-publisher and returns NotFound for unknown jobs', async () => {
    const deps = setup();
    const created = await createJobDraft(deps, input, DEFAULT_JOB_LIMITS, new Date());
    if (!created.ok) throw new Error('setup failed');
    const stranger = await closeJob(deps, created.value.id, 'someone-else');
    expect(stranger.ok).toBe(false);
    const missing = await expireJob(deps, 'nope', 'system-1');
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.error.kind).toBe('NotFound');
  });
});
