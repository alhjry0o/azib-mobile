import { createMockAmbassadorRepository } from '../ambassador';
import { createMockOfferReportRepository } from '../offer-report';
import { createMockPartnerEngagementRepository } from '../partner-engagement';
import { createMockPartnerVerificationRepository } from '../partner-verification';

describe('MockPartnerVerificationRepository', () => {
  it('requires documents and starts pending', async () => {
    const repo = createMockPartnerVerificationRepository();
    const bad = await repo.submit({ partnerId: 'p1', submittedBy: 'u1', documentFileIds: [] });
    expect(bad.ok).toBe(false);
    const created = await repo.submit({
      partnerId: 'p1',
      submittedBy: 'u1',
      documentFileIds: ['file-1'],
    });
    expect(created.ok).toBe(true);
    if (created.ok) {
      expect(created.value.status).toBe('pending');
      expect(created.value.dataOrigin).toBe('demo');
    }
  });

  it('requires a reason to reject and cannot decide twice', async () => {
    const repo = createMockPartnerVerificationRepository();
    const created = await repo.submit({
      partnerId: 'p1',
      submittedBy: 'u1',
      documentFileIds: ['file-1'],
    });
    if (!created.ok) throw new Error('setup failed');
    const noReason = await repo.decide(created.value.id, {
      decision: 'rejected',
      decidedBy: 'verifier-1',
    });
    expect(noReason.ok).toBe(false);
    const verified = await repo.decide(created.value.id, {
      decision: 'verified',
      decidedBy: 'verifier-1',
      validUntil: '2027-01-01T00:00:00.000Z',
    });
    expect(verified.ok).toBe(true);
    const again = await repo.decide(created.value.id, {
      decision: 'rejected',
      decidedBy: 'verifier-1',
      reasonKey: 'x',
    });
    expect(again.ok).toBe(false);
  });

  it('returns the latest record per partner', async () => {
    const repo = createMockPartnerVerificationRepository();
    await repo.submit({ partnerId: 'p1', submittedBy: 'u1', documentFileIds: ['a'] });
    const second = await repo.submit({
      partnerId: 'p1',
      submittedBy: 'u1',
      documentFileIds: ['b'],
    });
    const latest = await repo.getLatest('p1');
    expect(latest.ok).toBe(true);
    if (latest.ok && second.ok) expect(latest.value?.id).toBe(second.value.id);
    const none = await repo.getLatest('unknown');
    if (none.ok) expect(none.value).toBeNull();
  });
});

describe('MockOfferReportRepository', () => {
  it('creates an open report and resolves it with an actor', async () => {
    const repo = createMockOfferReportRepository();
    const created = await repo.create({
      offerId: 'o1',
      reporterId: 'u1',
      reasonKey: 'marketplace:report.reasons.wrongDiscount',
      detail: 'Discount not honoured at the shop.',
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.value.status).toBe('open');
    const resolved = await repo.updateStatus(created.value.id, 'resolved', 'moderator-1', 'ok');
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      expect(resolved.value.resolvedBy).toBe('moderator-1');
      expect(resolved.value.resolvedAt).toBeTruthy();
    }
    const listed = await repo.listByOffer('o1');
    if (listed.ok) expect(listed.value.length).toBe(1);
  });

  it('rejects an empty detail', async () => {
    const repo = createMockOfferReportRepository();
    const bad = await repo.create({
      offerId: 'o1',
      reporterId: 'u1',
      reasonKey: 'r',
      detail: '   ',
    });
    expect(bad.ok).toBe(false);
  });
});

describe('MockPartnerEngagementRepository', () => {
  it('saves once per user/offer and unsaves', async () => {
    const repo = createMockPartnerEngagementRepository();
    await repo.save('u1', 'o1');
    await repo.save('u1', 'o1');
    const saved = await repo.listSaved('u1');
    expect(saved.ok).toBe(true);
    if (saved.ok) expect(saved.value.length).toBe(1);
    await repo.unsave('u1', 'o1');
    const after = await repo.listSaved('u1');
    if (after.ok) expect(after.value.length).toBe(0);
  });

  it('aggregates views without any viewer identity', async () => {
    const repo = createMockPartnerEngagementRepository();
    await repo.recordView('o1');
    const second = await repo.recordView('o1');
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.value).toBe(2);
    const many = await repo.getViewsForOffers(['o1', 'o2']);
    expect(many.ok).toBe(true);
    if (many.ok) expect(many.value).toEqual({ o1: 2, o2: 0 });
    expect(Object.keys(repo)).not.toContain('listViewerIds');
  });
});

describe('MockAmbassadorRepository', () => {
  it('applies once and requires a reason to reject', async () => {
    const repo = createMockAmbassadorRepository();
    const applied = await repo.apply({
      userId: 'u1',
      governorateIds: ['sanaa'],
      motivation: 'I can nominate partners in my area.',
    });
    expect(applied.ok).toBe(true);
    const twice = await repo.apply({
      userId: 'u1',
      governorateIds: ['sanaa'],
      motivation: 'again',
    });
    expect(twice.ok).toBe(false);
    if (!applied.ok) return;
    const noReason = await repo.decideApplication(applied.value.id, 'rejected', 'moderator-1');
    expect(noReason.ok).toBe(false);
    const approved = await repo.decideApplication(applied.value.id, 'approved', 'moderator-1');
    expect(approved.ok).toBe(true);
  });

  it('creates regional tasks and records a nomination', async () => {
    const repo = createMockAmbassadorRepository();
    const task = await repo.createTask({
      ambassadorId: 'u1',
      kind: 'nominate_partner',
      governorateId: 'sanaa',
      titleKey: 'marketplace:ambassador.tasks.nominate',
    });
    expect(task.ok).toBe(true);
    if (!task.ok) return;
    const submitted = await repo.updateTask(task.value.id, {
      status: 'submitted',
      nominatedPartnerId: 'p1',
      submittedAt: '2026-06-01T00:00:00.000Z',
    });
    expect(submitted.ok).toBe(true);
    if (submitted.ok) expect(submitted.value.nominatedPartnerId).toBe('p1');
    const byRegion = await repo.listTasksByRegion('sanaa');
    if (byRegion.ok) expect(byRegion.value.length).toBe(1);
    const byAmbassador = await repo.listTasks('u1');
    if (byAmbassador.ok) expect(byAmbassador.value.length).toBe(1);
  });

  it('propagates forced errors', async () => {
    const repo = createMockAmbassadorRepository({ forceErrorKind: 'Network' });
    const result = await repo.listApplications();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('Network');
  });
});
