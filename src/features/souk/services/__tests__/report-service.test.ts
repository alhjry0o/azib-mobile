import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockSoukReportRepository } from '@/repositories/mock/souk-report';
import { createReport, resolveReport } from '../report-service';

function setup() {
  return { reports: createMockSoukReportRepository(), audit: createMockAuditRepository() };
}

const input = {
  itemId: 'i1',
  targetKind: 'item' as const,
  targetId: 'i1',
  reporterId: 'u1',
  reasonKey: 'marketplace:souk.report.reasons.forSale',
  detail: 'The description asks for money in exchange.',
};

describe('souk report service', () => {
  it('creates an open report and writes one audit entry', async () => {
    const deps = setup();
    const created = await createReport(deps, input);
    expect(created.ok).toBe(true);
    if (created.ok) expect(created.value.status).toBe('open');
    const entries = await deps.audit.list();
    if (entries.ok) expect(entries.value.total).toBe(1);
  });

  it('validates the reason and the detail', async () => {
    const deps = setup();
    expect((await createReport(deps, { ...input, detail: 'short' })).ok).toBe(false);
    expect((await createReport(deps, { ...input, reasonKey: '' })).ok).toBe(false);
    expect((await createReport(deps, { ...input, reporterId: '' })).ok).toBe(false);
  });

  it('only staff resolve a report', async () => {
    const deps = setup();
    const created = await createReport(deps, input);
    if (!created.ok) throw new Error('setup failed');
    const denied = await resolveReport(deps, created.value.id, 'member', 'u1', 'resolved');
    expect(denied.ok).toBe(false);
    const resolved = await resolveReport(
      deps,
      created.value.id,
      'moderator',
      'mod-1',
      'resolved',
      'marketplace:souk.report.resolved',
    );
    expect(resolved.ok).toBe(true);
    if (resolved.ok) expect(resolved.value.resolvedBy).toBe('mod-1');
  });

  it('returns NotFound for an unknown report', async () => {
    const deps = setup();
    const result = await resolveReport(deps, 'nope', 'moderator', 'mod-1', 'dismissed');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('NotFound');
  });
});
