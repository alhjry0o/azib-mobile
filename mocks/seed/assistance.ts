// Standalone demo assistance payloads (D-14). NOT part of SeedBundle, so the
// existing seed test and populator are untouched.
// Everything here is fabricated: fictional identifiers, demo hashes, no PII.
import type { ApplicationPayload } from '@/repositories/contracts/application';

export const SEED_ASSISTANCE_DATA_ORIGIN = 'demo' as const;

const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);
const HASH_C = 'c'.repeat(64);
const HASH_D = 'd'.repeat(64);

function doc(
  id: string,
  kind: ApplicationPayload['documents'][number]['kind'],
  sha256: string,
): ApplicationPayload['documents'][number] {
  return {
    id,
    kind,
    fileId: `seed-file-${id}`,
    fileName: `${id}.pdf`,
    mimeType: 'application/pdf',
    size: 240_000,
    sha256,
    uploadedAt: '2026-01-05T09:00:00.000Z',
  };
}

export const seedAssistancePayloads: readonly ApplicationPayload[] = [
  {
    applicant: {
      governorateId: 'sanaa',
      districtId: 'maeen',
      birthYear: 1998,
      householdSize: 5,
      identityHash: HASH_A,
      phoneHash: HASH_B,
    },
    income: {
      employmentStatus: 'employed',
      incomeSource: 'salary',
      monthlyIncome: 90_000,
      stabilityMonths: 24,
    },
    assets: {
      availableAssets: 40_000,
      restrictedAssets: 900_000,
      unreceivedInheritance: 1_500_000,
      savings: 20_000,
    },
    obligations: {
      monthlyRent: 35_000,
      monthlyDebtPayments: 10_000,
      monthlyEssentials: 45_000,
      dependentsCount: 3,
    },
    engagement: {
      engagementStatus: 'official_engagement',
      engagementProofType: 'engagement_certificate',
    },
    documents: [doc('seed-doc-1', 'identity', HASH_C), doc('seed-doc-2', 'engagement_proof', HASH_D)],
    declarations: {
      truthful: true,
      verificationConsent: true,
      processingConsent: true,
      publicationConsent: false,
    },
  },
  {
    applicant: {
      governorateId: 'aden',
      districtId: 'khormaksar',
      birthYear: 1995,
      householdSize: 3,
      identityHash: HASH_B,
      phoneHash: HASH_C,
    },
    income: {
      employmentStatus: 'irregular',
      incomeSource: 'daily_wage',
      monthlyIncome: 60_000,
      stabilityMonths: 8,
    },
    assets: {
      availableAssets: 0,
      restrictedAssets: 0,
      unreceivedInheritance: 0,
      savings: 0,
    },
    obligations: {
      monthlyRent: 25_000,
      monthlyDebtPayments: 0,
      monthlyEssentials: 30_000,
      dependentsCount: 1,
    },
    engagement: {
      engagementStatus: 'serious_family_approval',
      engagementProofType: 'family_letter',
    },
    documents: [doc('seed-doc-3', 'identity', HASH_D)],
    declarations: {
      truthful: true,
      verificationConsent: true,
      processingConsent: true,
      publicationConsent: true,
    },
  },
];
