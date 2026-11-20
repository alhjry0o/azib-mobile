import type { Disbursement } from '@/repositories/contracts/disbursement';
import type { Donation } from '@/repositories/contracts/donation';
import {
  SMALL_NUMBER_THRESHOLD,
  buildStatCell,
  computeCommunityStats,
  suppressSmallNumber,
  totalRecordCount,
} from '../stats-privacy';

function donation(index: number, patch: Partial<Donation> = {}): Donation {
  return {
    id: `don-${index}`,
    donorId: `donor-${index}`,
    amount: 10000,
    currency: 'YER',
    status: 'confirmed',
    note: null,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
    dataOrigin: 'demo',
    ...patch,
  };
}

function disbursement(index: number, patch: Partial<Disbursement> = {}): Disbursement {
  return {
    id: `dis-${index}`,
    applicationId: `app-${index}`,
    amount: 5000,
    currency: 'YER',
    status: 'confirmed',
    providerReference: null,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
    dataOrigin: 'demo',
    ...patch,
  };
}

describe('suppressSmallNumber', () => {
  it('uses the provisional policy threshold of ten', () => {
    expect(SMALL_NUMBER_THRESHOLD).toBe(10);
  });

  it('suppresses counts below the threshold', () => {
    expect(suppressSmallNumber(0).kind).toBe('suppressed');
    expect(suppressSmallNumber(9).kind).toBe('suppressed');
  });

  it('shows counts at or above the threshold', () => {
    const result = suppressSmallNumber(10);
    expect(result.kind).toBe('value');
    if (result.kind === 'value') expect(result.value).toBe(10);
  });

  it('suppresses non-finite input', () => {
    expect(suppressSmallNumber(Number.NaN).kind).toBe('suppressed');
  });
});

describe('buildStatCell', () => {
  it('suppresses the amount together with a small count', () => {
    const cell = buildStatCell(3, 900000);
    expect(cell.count.kind).toBe('suppressed');
    expect(cell.total.kind).toBe('suppressed');
  });

  it('shows the amount when the count is publishable', () => {
    const cell = buildStatCell(12, 120000);
    expect(cell.count.kind).toBe('value');
    expect(cell.total.kind).toBe('value');
    if (cell.total.kind === 'value') expect(cell.total.value).toBe(120000);
  });
});

describe('computeCommunityStats', () => {
  it('counts confirmed records only', () => {
    const donations = [
      ...Array.from({ length: 12 }, (_, i) => donation(i)),
      donation(99, { status: 'pending' }),
      donation(98, { status: 'declined' }),
    ];
    const stats = computeCommunityStats({
      donations,
      disbursements: [],
      beneficiaries: [],
    });
    expect(stats.demo.donations.count.kind).toBe('value');
    if (stats.demo.donations.count.kind === 'value') {
      expect(stats.demo.donations.count.value).toBe(12);
    }
    if (stats.demo.donations.total.kind === 'value') {
      expect(stats.demo.donations.total.value).toBe(120000);
    }
  });

  it('never mixes demo and real records', () => {
    const donations = [
      ...Array.from({ length: 12 }, (_, i) => donation(i)),
      ...Array.from({ length: 15 }, (_, i) => donation(100 + i, { dataOrigin: 'real' })),
    ];
    const stats = computeCommunityStats({
      donations,
      disbursements: [],
      beneficiaries: [],
    });
    if (stats.demo.donations.count.kind === 'value') {
      expect(stats.demo.donations.count.value).toBe(12);
    }
    if (stats.real.donations.count.kind === 'value') {
      expect(stats.real.donations.count.value).toBe(15);
    }
  });

  it('suppresses the small demo dataset produced by the seed tool', () => {
    const stats = computeCommunityStats({
      donations: [donation(1), donation(2), donation(3)],
      disbursements: [disbursement(1), disbursement(2)],
      beneficiaries: [{ dataOrigin: 'demo' }, { dataOrigin: 'demo' }],
    });
    expect(stats.demo.donations.count.kind).toBe('suppressed');
    expect(stats.demo.disbursements.total.kind).toBe('suppressed');
    expect(stats.demo.beneficiaries.kind).toBe('suppressed');
  });

  it('honours a custom threshold', () => {
    const stats = computeCommunityStats({
      donations: [donation(1), donation(2)],
      disbursements: [],
      beneficiaries: [],
      threshold: 2,
    });
    expect(stats.demo.donations.count.kind).toBe('value');
  });
});

describe('totalRecordCount', () => {
  it('counts every record regardless of status or origin', () => {
    expect(
      totalRecordCount({
        donations: [donation(1, { status: 'pending' })],
        disbursements: [],
        beneficiaries: [{ dataOrigin: 'real' }],
      }),
    ).toBe(2);
  });
});
