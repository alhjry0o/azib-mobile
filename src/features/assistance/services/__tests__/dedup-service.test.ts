import type { Application, ApplicationPayload } from '@/repositories/contracts/application';
import { seedAssistancePayloads } from '../../../../../mocks/seed/assistance';
import { createMockDedupService } from '../dedup-service';
import { fingerprint, sha256Hex } from '../hash';

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(async (_algorithm: string, data: string) => `sha256:${data}`),
}));

const payload = seedAssistancePayloads[0] as ApplicationPayload;
const NOW = new Date('2026-11-16T12:00:00.000Z');

function application(
  id: string,
  applicantId: string,
  overrides: Partial<ApplicationPayload> = {},
  submittedAt: string | null = '2026-11-10T12:00:00.000Z',
): Application {
  return {
    id,
    applicantId,
    programId: 'p1',
    status: 'submitted',
    requestedAmount: 100_000,
    currency: 'YER',
    notes: null,
    reviewerNote: null,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
    dataOrigin: 'demo',
    submittedAt,
    payload: { ...payload, ...overrides },
  };
}

describe('hash boundary', () => {
  it('fingerprints ignore whitespace, dashes and case', async () => {
    const a = await fingerprint(' 01-ABC ');
    const b = await fingerprint('01abc');
    expect(a.ok && b.ok).toBe(true);
    if (a.ok && b.ok) expect(a.value).toBe(b.value);
  });

  it('rejects empty input', async () => {
    const result = await sha256Hex('   ');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('EMPTY_HASH_INPUT');
  });
});

describe('mock dedup service', () => {
  const service = createMockDedupService();
  const probe = {
    applicantId: 'new-applicant',
    identityHash: payload.applicant.identityHash,
    phoneHash: payload.applicant.phoneHash,
    documentHashes: payload.documents.map((d) => d.sha256),
    now: NOW,
  };

  it('returns clean signals for an empty repository', async () => {
    const signals = await service.inspect(probe, [], 30);
    expect(signals.identityDuplicate).toBe(false);
    expect(signals.phoneDuplicate).toBe(false);
    expect(signals.documentReused).toBe(false);
    expect(signals.recentSubmissionCount).toBe(0);
  });

  it('detects identity, phone and document reuse by another applicant', async () => {
    const signals = await service.inspect(probe, [application('a1', 'someone-else')], 30);
    expect(signals.identityDuplicate).toBe(true);
    expect(signals.phoneDuplicate).toBe(true);
    expect(signals.documentReused).toBe(true);
  });

  it('does not treat the same applicant as an identity duplicate', async () => {
    const signals = await service.inspect(
      { ...probe, applicantId: 'same' },
      [application('a1', 'same')],
      30,
    );
    expect(signals.identityDuplicate).toBe(false);
    expect(signals.recentSubmissionCount).toBe(1);
  });

  it('counts only submissions inside the window', async () => {
    const signals = await service.inspect(
      { ...probe, applicantId: 'same' },
      [application('a1', 'same', {}, '2026-01-01T00:00:00.000Z')],
      30,
    );
    expect(signals.recentSubmissionCount).toBe(0);
  });

  it('ignores applications without a payload', async () => {
    const bare: Application = { ...application('a2', 'other'), payload: null };
    const signals = await service.inspect(probe, [bare], 30);
    expect(signals.identityDuplicate).toBe(false);
    expect(signals.documentReused).toBe(false);
  });
});
