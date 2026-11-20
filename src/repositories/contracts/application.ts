import type { Result } from '@/core/result';
import type { BaseEntity, ListQuery, PagedResult } from '../types';

// P08.1: the union is extended additively. 'reviewing' and 'disbursed' remain
// valid legacy values (read-only aliases) so P03 contract tests keep passing.
export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'disbursed'
  | 'in_review'
  | 'info_requested'
  | 'appealed'
  | 'appeal_resolved'
  | 'disbursing'
  | 'completed'
  | 'cancelled';

export type EmploymentStatus = 'employed' | 'self_employed' | 'irregular' | 'unemployed';
export type IncomeSource = 'salary' | 'business' | 'daily_wage' | 'none';
export type EngagementStatus = 'official_engagement' | 'serious_family_approval';
export type EngagementProofType =
  | 'engagement_certificate'
  | 'family_letter'
  | 'guardian_statement';
export type ApplicationDocumentKind = 'identity' | 'income_proof' | 'engagement_proof' | 'other';

export interface ApplicantInfo {
  readonly governorateId: string;
  readonly districtId: string | null;
  readonly birthYear: number;
  readonly householdSize: number;
  /** Pseudonymous fingerprints. Raw id / phone are never stored. */
  readonly identityHash: string;
  readonly phoneHash: string;
}

export interface IncomeInfo {
  readonly employmentStatus: EmploymentStatus;
  readonly incomeSource: IncomeSource;
  readonly monthlyIncome: number;
  readonly stabilityMonths: number;
}

export interface AssetsInfo {
  readonly availableAssets: number;
  readonly restrictedAssets: number;
  readonly unreceivedInheritance: number;
  readonly savings: number;
}

export interface ObligationsInfo {
  readonly monthlyRent: number;
  readonly monthlyDebtPayments: number;
  readonly monthlyEssentials: number;
  readonly dependentsCount: number;
}

export interface EngagementInfo {
  readonly engagementStatus: EngagementStatus;
  readonly engagementProofType: EngagementProofType;
}

export interface ApplicationDocument {
  readonly id: string;
  readonly kind: ApplicationDocumentKind;
  readonly fileId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly size: number;
  readonly sha256: string;
  readonly uploadedAt: string;
}

export interface Declarations {
  readonly truthful: boolean;
  readonly verificationConsent: boolean;
  readonly processingConsent: boolean;
  readonly publicationConsent: boolean;
}

export interface ApplicationPayload {
  readonly applicant: ApplicantInfo;
  readonly income: IncomeInfo;
  readonly assets: AssetsInfo;
  readonly obligations: ObligationsInfo;
  readonly engagement: EngagementInfo;
  readonly documents: readonly ApplicationDocument[];
  readonly declarations: Declarations;
}

export interface EvaluationGate {
  readonly key: string;
  readonly passed: boolean;
  readonly reasonKey: string;
}

export interface EvaluationComponent {
  readonly key: string;
  readonly weight: number;
  readonly normalized: number;
  readonly points: number;
  readonly explanationKey: string;
}

export interface EvaluationFlag {
  readonly key: string;
  readonly labelKey: string;
}

/** Advisory only (ADR-0006). Never a decision. */
export interface AdvisoryEvaluation {
  readonly ruleVersion: string;
  readonly advisory: true;
  readonly gatePassed: boolean;
  readonly gates: readonly EvaluationGate[];
  readonly breakdown: readonly EvaluationComponent[];
  readonly totalScore: number;
  readonly bandId: string;
  readonly bandLabelKey: string;
  readonly recommendationKey: string;
  readonly flags: readonly EvaluationFlag[];
  readonly evaluatedAt: string;
}

export interface InfoRequestItem {
  readonly fieldKey: string;
  readonly reasonKey: string;
}

export interface InfoRequest {
  readonly items: readonly InfoRequestItem[];
  readonly requestedAt: string;
  readonly reviewerId: string | null;
}

export interface ReviewDecision {
  readonly outcome: 'approved' | 'rejected';
  readonly reasonKeys: readonly string[];
  readonly reviewerId: string;
  readonly decidedAt: string;
  readonly note: string | null;
}

export interface AppealResolution {
  readonly outcome: 'approved' | 'rejected';
  readonly reasonKeys: readonly string[];
  readonly reviewerId: string;
  readonly decidedAt: string;
}

export interface AppealRecord {
  readonly submittedAt: string;
  readonly statement: string;
  readonly documentIds: readonly string[];
  readonly status: 'pending' | 'resolved';
  readonly resolution: AppealResolution | null;
}

export interface PublicationConsentRecord {
  readonly grantedAt: string;
  readonly revokedAt: string | null;
  readonly version: string;
}

/** Version stamped on publication consent captured at submit time. */
export const PUBLICATION_CONSENT_VERSION = 'draft-1';

export interface Application extends BaseEntity {
  readonly applicantId: string;
  readonly programId: string;
  readonly status: ApplicationStatus;
  readonly requestedAmount: number;
  readonly currency: 'YER';
  readonly notes: string | null;
  readonly reviewerNote: string | null;
  readonly referenceNumber?: string | null;
  readonly submittedAt?: string | null;
  readonly payload?: ApplicationPayload | null;
  readonly evaluation?: AdvisoryEvaluation | null;
  readonly infoRequest?: InfoRequest | null;
  readonly decision?: ReviewDecision | null;
  readonly appeal?: AppealRecord | null;
  readonly publicationConsent?: PublicationConsentRecord | null;
}

export interface CreateApplicationInput {
  readonly applicantId: string;
  readonly programId: string;
  readonly requestedAmount: number;
  readonly notes?: string | null;
  readonly payload?: ApplicationPayload;
}

/** Status is intentionally absent: it changes only via updateStatus/submit. */
export interface UpdateApplicationInput {
  readonly requestedAmount?: number;
  readonly notes?: string | null;
  readonly payload?: ApplicationPayload;
  readonly evaluation?: AdvisoryEvaluation | null;
  readonly infoRequest?: InfoRequest | null;
  readonly decision?: ReviewDecision | null;
  readonly appeal?: AppealRecord | null;
  readonly publicationConsent?: PublicationConsentRecord | null;
}

export interface ApplicationListQuery extends ListQuery {
  readonly status?: ApplicationStatus;
  readonly programId?: string;
  readonly applicantId?: string;
}

export interface ApplicationRepository {
  getById(id: string): Promise<Result<Application | null>>;
  list(query?: ApplicationListQuery): Promise<Result<PagedResult<Application>>>;
  listByApplicant(applicantId: string): Promise<Result<readonly Application[]>>;
  create(input: CreateApplicationInput): Promise<Result<Application>>;
  updateStatus(
    id: string,
    status: ApplicationStatus,
    reviewerNote?: string,
  ): Promise<Result<Application>>;
  /** P08.1 — patch applicant fields and workflow metadata (never status). */
  update(id: string, input: UpdateApplicationInput): Promise<Result<Application>>;
  /**
   * P08.1 — atomic submit: draft|info_requested → submitted, mints the
   * reference number once (provider-side), stamps submittedAt and captures
   * publication consent from the declarations.
   */
  submit(id: string): Promise<Result<Application>>;
  delete(id: string): Promise<Result<void>>;
}
