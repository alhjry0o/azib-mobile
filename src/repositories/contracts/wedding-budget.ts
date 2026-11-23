import type { Result } from '@/core/result';
import type { BaseEntity } from '../types';

export const BUDGET_CATEGORIES = [
  'hall',
  'artists',
  'baraa',
  'sound_light',
  'water_drinks',
  'hospitality',
  'organization',
  'clothing',
  'other',
] as const;
export type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];

export type SplitMode = 'equal' | 'weighted' | 'custom';
export type BudgetVersionStatus = 'draft' | 'adopted' | 'superseded';
export type BudgetScope = 'shared' | 'individual';
export type ServiceRequestStatus = 'sent' | 'accepted' | 'declined' | 'cancelled';

export interface MemberWeight {
  readonly memberId: string;
  readonly weight: number;
}
export interface MemberCustomShare {
  readonly memberId: string;
  readonly amount: number;
}

export interface BudgetVersion extends BaseEntity {
  readonly groupId: string;
  readonly version: number;
  readonly status: BudgetVersionStatus;
  readonly splitMode: SplitMode;
  readonly weights: readonly MemberWeight[];
  readonly customShares: readonly MemberCustomShare[];
  readonly adoptedAt?: string | null;
}

export interface BudgetItem extends BaseEntity {
  readonly versionId: string;
  readonly groupId: string;
  readonly category: BudgetCategory;
  readonly labelKey: string;
  readonly amount: number;
  readonly scope: BudgetScope;
  readonly memberId?: string | null;
  readonly offerId?: string | null;
}

export interface ShareApproval extends BaseEntity {
  readonly versionId: string;
  readonly userId: string;
  readonly approved: boolean;
  readonly approvedAt?: string | null;
}

export interface WeddingAgreement extends BaseEntity {
  readonly groupId: string;
  readonly versionId: string;
  readonly summaryKey: string;
  readonly acknowledgements: readonly string[];
}

export interface ServiceRequest extends BaseEntity {
  readonly groupId: string;
  readonly partnerId: string;
  readonly categoryKey: string;
  readonly message: string;
  readonly status: ServiceRequestStatus;
  readonly reply?: string | null;
  readonly decidedAt?: string | null;
}

export interface CreateBudgetVersionInput {
  readonly groupId: string;
  readonly version: number;
  readonly splitMode: SplitMode;
  readonly weights?: readonly MemberWeight[];
  readonly customShares?: readonly MemberCustomShare[];
}

export interface UpdateBudgetVersionInput {
  readonly status?: BudgetVersionStatus;
  readonly splitMode?: SplitMode;
  readonly weights?: readonly MemberWeight[];
  readonly customShares?: readonly MemberCustomShare[];
  readonly adoptedAt?: string | null;
}

export interface CreateBudgetItemInput {
  readonly versionId: string;
  readonly groupId: string;
  readonly category: BudgetCategory;
  readonly labelKey: string;
  readonly amount: number;
  readonly scope: BudgetScope;
  readonly memberId?: string | null;
  readonly offerId?: string | null;
}

export interface CreateAgreementInput {
  readonly groupId: string;
  readonly versionId: string;
  readonly summaryKey: string;
}

export interface CreateServiceRequestInput {
  readonly groupId: string;
  readonly partnerId: string;
  readonly categoryKey: string;
  readonly message: string;
}

export interface WeddingBudgetRepository {
  getVersion(id: string): Promise<Result<BudgetVersion | null>>;
  listVersions(groupId: string): Promise<Result<readonly BudgetVersion[]>>;
  createVersion(input: CreateBudgetVersionInput): Promise<Result<BudgetVersion>>;
  updateVersion(id: string, input: UpdateBudgetVersionInput): Promise<Result<BudgetVersion>>;
  listItems(versionId: string): Promise<Result<readonly BudgetItem[]>>;
  addItem(input: CreateBudgetItemInput): Promise<Result<BudgetItem>>;
  removeItem(id: string): Promise<Result<void>>;
  listApprovals(versionId: string): Promise<Result<readonly ShareApproval[]>>;
  approveShare(versionId: string, userId: string): Promise<Result<ShareApproval>>;
  getAgreement(id: string): Promise<Result<WeddingAgreement | null>>;
  listAgreements(groupId: string): Promise<Result<readonly WeddingAgreement[]>>;
  createAgreement(input: CreateAgreementInput): Promise<Result<WeddingAgreement>>;
  acknowledgeAgreement(id: string, userId: string): Promise<Result<WeddingAgreement>>;
  listServiceRequests(groupId: string): Promise<Result<readonly ServiceRequest[]>>;
  createServiceRequest(input: CreateServiceRequestInput): Promise<Result<ServiceRequest>>;
  updateServiceRequest(
    id: string,
    status: ServiceRequestStatus,
    reply?: string | null,
  ): Promise<Result<ServiceRequest>>;
}
