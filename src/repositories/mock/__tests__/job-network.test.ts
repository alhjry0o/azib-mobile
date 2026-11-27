import { createMockJobApplicationRepository } from '../job-application';
import { createMockJobEngagementRepository } from '../job-engagement';
import { createMockVolunteerTaskRepository } from '../volunteer-task';

describe('MockJobApplicationRepository', () => {
  it('starts submitted with a real stamp and no decision', async () => {
    const repo = createMockJobApplicationRepository();
    const created = await repo.create({
      jobId: 'j1',
      applicantId: 'u1',
      headline: 'Retail experience',
      message: 'I have two years of shop experience.',
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.value.status).toBe('submitted');
    expect(created.value.submittedAt).toBeTruthy();
    expect(created.value.viewedAt).toBeNull();
    expect(created.value.cvFileId).toBeNull();
    expect(created.value.dataOrigin).toBe('demo');
  });

  it('lists by job and applicant, updates, and returns NotFound', async () => {
    const repo = createMockJobApplicationRepository();
    await repo.create({ jobId: 'j1', applicantId: 'u1', headline: 'H', message: 'M' });
    await repo.create({ jobId: 'j2', applicantId: 'u1', headline: 'H', message: 'M' });
    const byJob = await repo.listByJob('j1');
    if (byJob.ok) expect(byJob.value.length).toBe(1);
    const byApplicant = await repo.listByApplicant('u1');
    if (byApplicant.ok) expect(byApplicant.value.length).toBe(2);
    const missing = await repo.update('nope', { status: 'viewed' });
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.error.kind).toBe('NotFound');
  });

  it('rejects invalid input and propagates forced errors', async () => {
    const repo = createMockJobApplicationRepository();
    const bad = await repo.create({ jobId: '', applicantId: '', headline: ' ', message: ' ' });
    expect(bad.ok).toBe(false);
    const forced = createMockJobApplicationRepository({ forceErrorKind: 'Network' });
    const result = await forced.list();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('Network');
  });
});

describe('MockJobEngagementRepository', () => {
  it('saves once per user/job and unsaves', async () => {
    const repo = createMockJobEngagementRepository();
    await repo.save('u1', 'j1');
    await repo.save('u1', 'j1');
    const saved = await repo.listSaved('u1');
    if (saved.ok) expect(saved.value.length).toBe(1);
    await repo.unsave('u1', 'j1');
    const after = await repo.listSaved('u1');
    if (after.ok) expect(after.value.length).toBe(0);
  });

  it('creates open reports and settles them with an actor', async () => {
    const repo = createMockJobEngagementRepository();
    const created = await repo.createReport({
      jobId: 'j1',
      reporterId: 'u1',
      reasonKey: 'jobs:report.reasons.fake',
      detail: 'Asks for money to schedule an interview.',
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const settled = await repo.updateReportStatus(created.value.id, 'resolved', 'mod-1', 'ok');
    expect(settled.ok).toBe(true);
    if (settled.ok) {
      expect(settled.value.resolvedBy).toBe('mod-1');
      expect(settled.value.resolvedAt).toBeTruthy();
    }
    const byJob = await repo.listReportsByJob('j1');
    if (byJob.ok) expect(byJob.value.length).toBe(1);
  });
});

describe('MockVolunteerTaskRepository', () => {
  it('starts assigned with no report and no rating', async () => {
    const repo = createMockVolunteerTaskRepository();
    const created = await repo.create({
      volunteerId: 'v1',
      kind: 'donation_delivery',
      governorateId: 'sanaa',
      titleKey: 'marketplace:volunteers.tasks.delivery',
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.value.status).toBe('assigned');
    expect(created.value.report).toBeNull();
    expect(created.value.timelinessScore).toBeNull();
    expect(created.value.completionScore).toBeNull();
  });

  it('lists by volunteer and region, and updates fields', async () => {
    const repo = createMockVolunteerTaskRepository();
    const created = await repo.create({
      volunteerId: 'v1',
      kind: 'partner_visits',
      governorateId: 'aden',
      titleKey: 'marketplace:volunteers.tasks.partnerVisit',
    });
    if (!created.ok) throw new Error('setup failed');
    const byVolunteer = await repo.listByVolunteer('v1');
    if (byVolunteer.ok) expect(byVolunteer.value.length).toBe(1);
    const byRegion = await repo.listByRegion('aden');
    if (byRegion.ok) expect(byRegion.value.length).toBe(1);
    const updated = await repo.update(created.value.id, {
      status: 'completed',
      report: 'Visited the partner and recorded the outcome.',
    });
    expect(updated.ok).toBe(true);
    if (updated.ok) expect(updated.value.report).toBeTruthy();
  });
});
