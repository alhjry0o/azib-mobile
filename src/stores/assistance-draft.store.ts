// Assistance wizard draft (client state, ADR-0002 / D-6).
// Data minimization: raw national id and phone are NEVER persisted — only
// their fingerprints. Cleared on successful submit.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  ApplicationDocument,
  EmploymentStatus,
  EngagementProofType,
  EngagementStatus,
  IncomeSource,
} from '@/repositories/contracts/application';

export interface ApplicantDraft {
  governorateId: string;
  districtId: string | null;
  birthYear: number | null;
  householdSize: number | null;
  identityHash: string | null;
  phoneHash: string | null;
}
export interface IncomeDraft {
  employmentStatus: EmploymentStatus;
  incomeSource: IncomeSource;
  monthlyIncome: number | null;
  stabilityMonths: number | null;
}
export interface AssetsDraft {
  availableAssets: number | null;
  restrictedAssets: number | null;
  unreceivedInheritance: number | null;
  savings: number | null;
}
export interface ObligationsDraft {
  monthlyRent: number | null;
  monthlyDebtPayments: number | null;
  monthlyEssentials: number | null;
  dependentsCount: number | null;
}
export interface EngagementDraft {
  engagementStatus: EngagementStatus | null;
  engagementProofType: EngagementProofType | null;
}
export interface DeclarationsDraft {
  truthful: boolean;
  verificationConsent: boolean;
  processingConsent: boolean;
  publicationConsent: boolean;
}

export interface AssistanceDraftState {
  hydrated: boolean;
  programId: string | null;
  step: number;
  updatedAt: string | null;
  applicant: ApplicantDraft;
  income: IncomeDraft;
  assets: AssetsDraft;
  obligations: ObligationsDraft;
  engagement: EngagementDraft;
  documents: readonly ApplicationDocument[];
  declarations: DeclarationsDraft;
  requestedAmount: number | null;
  notes: string;
  setProgram: (programId: string) => void;
  setStep: (step: number) => void;
  patchApplicant: (patch: Partial<ApplicantDraft>) => void;
  patchIncome: (patch: Partial<IncomeDraft>) => void;
  patchAssets: (patch: Partial<AssetsDraft>) => void;
  patchObligations: (patch: Partial<ObligationsDraft>) => void;
  patchEngagement: (patch: Partial<EngagementDraft>) => void;
  patchDeclarations: (patch: Partial<DeclarationsDraft>) => void;
  addDocument: (document: ApplicationDocument) => void;
  removeDocument: (id: string) => void;
  setRequestedAmount: (value: number | null) => void;
  setNotes: (value: string) => void;
  clearFingerprints: () => void;
  reset: () => void;
  _setHydrated: (hydrated: boolean) => void;
}

export const ASSISTANCE_DRAFT_KEY = 'azib.assistance-draft.v1';

const INITIAL = {
  programId: null as string | null,
  step: 0,
  updatedAt: null as string | null,
  applicant: {
    governorateId: '',
    districtId: null,
    birthYear: null,
    householdSize: null,
    identityHash: null,
    phoneHash: null,
  } as ApplicantDraft,
  income: {
    employmentStatus: 'employed',
    incomeSource: 'salary',
    monthlyIncome: null,
    stabilityMonths: null,
  } as IncomeDraft,
  assets: {
    availableAssets: null,
    restrictedAssets: null,
    unreceivedInheritance: null,
    savings: null,
  } as AssetsDraft,
  obligations: {
    monthlyRent: null,
    monthlyDebtPayments: null,
    monthlyEssentials: null,
    dependentsCount: null,
  } as ObligationsDraft,
  engagement: { engagementStatus: null, engagementProofType: null } as EngagementDraft,
  documents: [] as readonly ApplicationDocument[],
  declarations: {
    truthful: false,
    verificationConsent: false,
    processingConsent: false,
    publicationConsent: false,
  } as DeclarationsDraft,
  requestedAmount: null as number | null,
  notes: '',
};

function stamp(): string {
  return new Date().toISOString();
}

export const useAssistanceDraftStore = create<AssistanceDraftState>()(
  persist(
    (set) => ({
      hydrated: false,
      ...INITIAL,
      setProgram: (programId) => set({ programId, step: 0, updatedAt: stamp() }),
      setStep: (step) => set({ step: Math.max(0, Math.min(7, step)), updatedAt: stamp() }),
      patchApplicant: (patch) =>
        set((s) => ({ applicant: { ...s.applicant, ...patch }, updatedAt: stamp() })),
      patchIncome: (patch) =>
        set((s) => ({ income: { ...s.income, ...patch }, updatedAt: stamp() })),
      patchAssets: (patch) =>
        set((s) => ({ assets: { ...s.assets, ...patch }, updatedAt: stamp() })),
      patchObligations: (patch) =>
        set((s) => ({ obligations: { ...s.obligations, ...patch }, updatedAt: stamp() })),
      patchEngagement: (patch) =>
        set((s) => ({ engagement: { ...s.engagement, ...patch }, updatedAt: stamp() })),
      patchDeclarations: (patch) =>
        set((s) => ({ declarations: { ...s.declarations, ...patch }, updatedAt: stamp() })),
      addDocument: (document) =>
        set((s) => ({
          documents: [...s.documents.filter((d) => d.id !== document.id), document],
          updatedAt: stamp(),
        })),
      removeDocument: (id) =>
        set((s) => ({ documents: s.documents.filter((d) => d.id !== id), updatedAt: stamp() })),
      setRequestedAmount: (requestedAmount) => set({ requestedAmount, updatedAt: stamp() }),
      setNotes: (notes) => set({ notes: notes.slice(0, 1000), updatedAt: stamp() }),
      clearFingerprints: () =>
        set((s) => ({
          applicant: { ...s.applicant, identityHash: null, phoneHash: null },
          updatedAt: stamp(),
        })),
      reset: () => set({ ...INITIAL }),
      _setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: ASSISTANCE_DRAFT_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        programId: state.programId,
        step: state.step,
        updatedAt: state.updatedAt,
        applicant: state.applicant,
        income: state.income,
        assets: state.assets,
        obligations: state.obligations,
        engagement: state.engagement,
        documents: state.documents,
        declarations: state.declarations,
        requestedAmount: state.requestedAmount,
        notes: state.notes,
      }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated(true);
      },
    },
  ),
);
