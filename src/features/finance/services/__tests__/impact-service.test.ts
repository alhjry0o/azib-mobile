import type { Disbursement } from '@/repositories/contracts/disbursement';
import type { Donation } from '@/repositories/contracts/donation';
import { computeImpactReport } from '../impact-service';

function donation(index: number, patch: Partial<Donation> = {}): Donation {
  return {
    id: `d-${index}`,
    donorId: `donor-${index}`,
    amount: 10000,
    currency: 'YER',
    status: 'verified',
    note: null,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
    dataOrigin: 'real',
    ...patch,
  };
}

function disbursement(index: number, patch: Partial<Disbursement> = {}): Disbursement {
  return {
    id: `p-${index}`,
    applicationId: `app-${index}`,
    amount: 5000,
    currency: 'YER',
    status: 'confirmed_by_beneficiary',
    providerReference: `proof-${index}`,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
    dataOrigin: 'real',
    ...patch,
  };
}

describe('impact report', () => {
  it('excludes demo data entirely', () => {
    const report = computeImpactReport({
      donations: Array.from({ length: 20 }, (_, i) => donation(i, { dataOrigin: 'demo' })),
      disbursements: Array.from({ length: 20 }, (_, i) =>
        disbursement(i, { dataOrigin: 'demo' }),
      ),
    });
    expect(report.hasRealData).toBe(false);
    for (const metric of report.metrics) expect(metric.count.kind).toBe('suppressed');
  });

  it('excludes unverified donations and unconfirmed disbursements', () => {
    const report = computeImpactReport({
      donations: Array.from({ length: 20 }, (_, i) =>
        donation(i, { status: 'provider_confirmed' }),
      ),
      disbursements: Array.from({ length: 20 }, (_, i) =>
        disbursement(i, { status: 'paid_recorded' }),
      ),
    });
    expect(report.hasRealData).toBe(false);
  });

  it('counts real verified rows and shows values above the threshold', () => {
    const report = computeImpactReport({
      donations: Array.from({ length: 12 }, (_, i) => donation(i)),
      disbursements: Array.from({ length: 12 }, (_, i) => disbursement(i)),
    });
    expect(report.hasRealData).toBe(true);
    const donations = report.metrics.find((m) => m.key === 'verifiedDonations');
    expect(donations?.count.kind).toBe('value');
    if (donations?.count.kind === 'value') expect(donations.count.value).toBe(12);
    if (donations?.total?.kind === 'value') expect(donations.total.value).toBe(120000);
  });

  it('withholds the amount whenever the count is small', () => {
    const report = computeImpactReport({
      donations: [donation(1)],
      disbursements: [],
    });
    const metric = report.metrics.find((m) => m.key === 'verifiedDonations');
    expect(metric?.count.kind).toBe('suppressed');
    expect(metric?.total?.kind).toBe('suppressed');
  });

  it('every metric carries a definition key', () => {
    const report = computeImpactReport({ donations: [], disbursements: [] });
    expect(report.metrics.length).toBe(3);
    for (const metric of report.metrics) {
      expect(metric.definitionKey.startsWith('assistance:finance.impact.definitions.')).toBe(true);
    }
  });

  it('honours a custom threshold', () => {
    const report = computeImpactReport({
      donations: [donation(1), donation(2)],
      disbursements: [],
      threshold: 2,
    });
    const metric = report.metrics.find((m) => m.key === 'verifiedDonations');
    expect(metric?.count.kind).toBe('value');
  });
});
