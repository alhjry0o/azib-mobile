import type { ApplicationPayload } from '@/repositories/contracts/application';
import { createMockApplicationRepository } from '@/repositories/mock/application';
import { createMockAuditRepository } from '@/repositories/mock/audit';
import { seedAssistancePayloads } from '../../../../../mocks/seed/assistance';
import { applyTransition } from '../workflow-service';

const payload = seedAssistancePayloads[0] as ApplicationPayload;
const NOW = new Date('2026-11-16T12:00:00.000Z');

async function setup() {
  const applications = createMockApplicationRepository();
  const audit = createMockAuditRepository();
  const created = await applications.create({
    applicantId: 'applicant-1',
    programId: 'program-1',
    requestedAmount: 150_000,
    payload,
  });
  if (!created.ok) throw new Error('setup failed');
  return { applications, audit, id: created.value.id };
}

describe('workflow service', () => {
  it('submits a draft and mints a demo reference number', async () => {
    const { applications, audit, id } = await setup();
    const result = await applyTransition(
      { applications, audit },
      { applicationId: id, to: 'submitted', actor: 'applicant', actorId: 'applicant-1' },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe('submitted');
    expect(result.value.referenceNumber).toContain('AZIB-DEMO-');
    const entries = await audit.list();
    expect(entries.ok).toBe(true);
    if (entries.ok) expect(entries.value.total).toBe(1);
  });

  it('rejects an invalid transition and writes no audit entry', async () => {
    const { applications, audit, id } = await setup();
    const result = await applyTransition(
      { applications, audit },
      { applicationId: id, to: 'approved', actor: 'reviewer', actorId: 'reviewer-1' },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('INVALID_TRANSITION');
    const entries = await audit.list();
    if (entries.ok) expect(entries.value.total).toBe(0);
  });

  it('rejects a transition performed by the wrong actor', async () => {
    const { applications, audit, id } = await setup();
    await applyTransition(
      { applications, audit },
      { applicationId: id, to: 'submitted', actor: 'applicant', actorId: 'applicant-1' },
    );
    const result = await applyTransition(
      { applications, audit },
      { applicationId: id, to: 'approved', actor: 'applicant', actorId: 'applicant-1' },
    );
    expect(result.ok).toBe(false);
  });

  it('returns NotFound for an unknown application', async () => {
    const applications = createMockApplicationRepository();
    const audit = createMockAuditRepository();
    const result = await applyTransition(
      { applications, audit },
      { applicationId: 'nope', to: 'submitted', actor: 'applicant', actorId: 'a' },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('NotFound');
  });

  it('allows one appeal only, inside the window', async () => {
    const { applications, audit, id } = await setup();
    const deps = { applications, audit };
    await applyTransition(deps, {
      applicationId: id,
      to: 'submitted',
      actor: 'applicant',
      actorId: 'applicant-1',
    });
    await applyTransition(deps, {
      applicationId: id,
      to: 'in_review',
      actor: 'reviewer',
      actorId: 'reviewer-1',
    });
    await applyTransition(deps, {
      applicationId: id,
      to: 'rejected',
      actor: 'reviewer',
      actorId: 'reviewer-1',
      patch: {
        decision: {
          outcome: 'rejected',
          reasonKeys: ['assistance:decision.rejected'],
          reviewerId: 'reviewer-1',
          decidedAt: NOW.toISOString(),
          note: null,
        },
      },
    });

    const appeal = await applyTransition(deps, {
      applicationId: id,
      to: 'appealed',
      actor: 'applicant',
      actorId: 'applicant-1',
      appealWindowDays: 14,
      now: NOW,
      patch: {
        appeal: {
          submittedAt: NOW.toISOString(),
          statement: 'Additional context provided.',
          documentIds: [],
          status: 'pending',
          resolution: null,
        },
      },
    });
    expect(appeal.ok).toBe(true);

    await applyTransition(deps, {
      applicationId: id,
      to: 'appeal_resolved',
      actor: 'reviewer',
      actorId: 'reviewer-2',
    });
    await applyTransition(deps, {
      applicationId: id,
      to: 'rejected',
      actor: 'reviewer',
      actorId: 'reviewer-2',
    });
    const second = await applyTransition(deps, {
      applicationId: id,
      to: 'appealed',
      actor: 'applicant',
      actorId: 'applicant-1',
      appealWindowDays: 14,
      now: NOW,
    });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error.meta.code).toBe('APPEAL_ALREADY_USED');
  });

  it('closes the appeal window after the configured days', async () => {
    const { applications, audit, id } = await setup();
    const deps = { applications, audit };
    await applyTransition(deps, {
      applicationId: id,
      to: 'submitted',
      actor: 'applicant',
      actorId: 'applicant-1',
    });
    await applyTransition(deps, {
      applicationId: id,
      to: 'in_review',
      actor: 'reviewer',
      actorId: 'reviewer-1',
    });
    await applyTransition(deps, {
      applicationId: id,
      to: 'rejected',
      actor: 'reviewer',
      actorId: 'reviewer-1',
      patch: {
        decision: {
          outcome: 'rejected',
          reasonKeys: ['assistance:decision.rejected'],
          reviewerId: 'reviewer-1',
          decidedAt: '2026-01-01T00:00:00.000Z',
          note: null,
        },
      },
    });
    const late = await applyTransition(deps, {
      applicationId: id,
      to: 'appealed',
      actor: 'applicant',
      actorId: 'applicant-1',
      appealWindowDays: 14,
      now: NOW,
    });
    expect(late.ok).toBe(false);
    if (!late.ok) expect(late.error.meta.code).toBe('APPEAL_WINDOW_CLOSED');
  });
});
