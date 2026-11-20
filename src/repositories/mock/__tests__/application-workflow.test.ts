import { createMockApplicationRepository } from '../application';
import { seedAssistancePayloads } from '../../../../mocks/seed/assistance';

const payload = seedAssistancePayloads[0];
const consenting = seedAssistancePayloads[1];

async function draft(withConsent = false) {
  const repo = createMockApplicationRepository();
  const created = await repo.create({
    applicantId: 'a1',
    programId: 'p1',
    requestedAmount: 120_000,
    payload: withConsent ? consenting : payload,
  });
  if (!created.ok) throw new Error('setup failed');
  return { repo, id: created.value.id };
}

describe('MockApplicationRepository — P08 additions', () => {
  it('create keeps the legacy defaults and stores the payload', async () => {
    const { repo, id } = await draft();
    const found = await repo.getById(id);
    expect(found.ok).toBe(true);
    if (!found.ok || !found.value) return;
    expect(found.value.status).toBe('draft');
    expect(found.value.dataOrigin).toBe('demo');
    expect(found.value.referenceNumber).toBeNull();
    expect(found.value.payload?.applicant.governorateId).toBe('sanaa');
  });

  it('submit mints a reference once and stamps submittedAt', async () => {
    const { repo, id } = await draft();
    const first = await repo.submit(id);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.value.status).toBe('submitted');
    expect(first.value.referenceNumber).toContain('AZIB-DEMO-');
    expect(first.value.submittedAt).toBeTruthy();

    await repo.updateStatus(id, 'info_requested');
    const second = await repo.submit(id);
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.value.referenceNumber).toBe(first.value.referenceNumber);
  });

  it('submit rejects a non-submittable status', async () => {
    const { repo, id } = await draft();
    await repo.updateStatus(id, 'approved');
    const result = await repo.submit(id);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('INVALID_TRANSITION');
  });

  it('submit captures publication consent only when declared', async () => {
    const without = await draft(false);
    const noConsent = await without.repo.submit(without.id);
    if (noConsent.ok) expect(noConsent.value.publicationConsent).toBeNull();

    const withDecl = await draft(true);
    const granted = await withDecl.repo.submit(withDecl.id);
    expect(granted.ok).toBe(true);
    if (granted.ok) {
      expect(granted.value.publicationConsent?.revokedAt).toBeNull();
      expect(granted.value.publicationConsent?.version).toBeTruthy();
    }
  });

  it('update patches metadata but never the status', async () => {
    const { repo, id } = await draft();
    const patched = await repo.update(id, { requestedAmount: 200_000, notes: 'updated' });
    expect(patched.ok).toBe(true);
    if (!patched.ok) return;
    expect(patched.value.requestedAmount).toBe(200_000);
    expect(patched.value.status).toBe('draft');
  });

  it('update and submit return NotFound for unknown ids', async () => {
    const repo = createMockApplicationRepository();
    const patched = await repo.update('nope', { notes: 'x' });
    const submitted = await repo.submit('nope');
    expect(patched.ok).toBe(false);
    expect(submitted.ok).toBe(false);
    if (!patched.ok) expect(patched.error.kind).toBe('NotFound');
    if (!submitted.ok) expect(submitted.error.kind).toBe('NotFound');
  });

  it('legacy statuses remain accepted by updateStatus', async () => {
    const { repo, id } = await draft();
    const reviewing = await repo.updateStatus(id, 'reviewing');
    const disbursed = await repo.updateStatus(id, 'disbursed');
    expect(reviewing.ok).toBe(true);
    expect(disbursed.ok).toBe(true);
  });

  it('new statuses are filterable through list', async () => {
    const { repo, id } = await draft();
    await repo.updateStatus(id, 'info_requested');
    const listed = await repo.list({ status: 'info_requested' });
    expect(listed.ok).toBe(true);
    if (listed.ok) expect(listed.value.total).toBe(1);
  });
});
