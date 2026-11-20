export * from './engine';
export * from './state-machine';
export type { DedupProbe, DedupService } from './services/dedup-service';
export { createMockDedupService } from './services/dedup-service';
export { fingerprint, sha256Hex } from './services/hash';
export type { AuditEventInput } from './services/audit-trail';
export { appendApplicationAudit } from './services/audit-trail';
export type { TransitionParams, WorkflowDeps } from './services/workflow-service';
export { applyTransition } from './services/workflow-service';
export type {
  PickedDocument,
  PreparedDocument,
} from './services/document-pipeline';
export {
  DOCUMENT_MAX_WIDTH,
  IMAGE_MIME_TYPES,
  PDF_MIME_TYPE,
  pickImageDocument,
  pickPdfDocument,
  prepareDocument,
  validateDocument,
} from './services/document-pipeline';
export type { SubmissionDeps, SubmissionInput } from './services/submission-service';
export { submitAssistance } from './services/submission-service';
export type { FieldErrors } from './schemas/wizard';
export {
  ApplicantStepSchema,
  AssetsStepSchema,
  DocumentsStepSchema,
  EngagementStepSchema,
  IncomeStepSchema,
  ObligationsStepSchema,
  ReviewStepSchema,
  buildPayload,
  collectFieldErrors,
} from './schemas/wizard';
export type { ProgramsApi, RulesApi } from './hooks/use-assistance-query';
export { rulesQueryKey, useEligibilityRules, useOpenPrograms } from './hooks/use-assistance-query';
export type { DocumentSource, DocumentUploadApi } from './hooks/use-document-upload';
export { useDocumentUpload } from './hooks/use-document-upload';
export type { SubmitApi } from './hooks/use-submit-application';
export { useSubmitApplication } from './hooks/use-submit-application';
export { NumericField } from './components/NumericField';
export { WizardProgress } from './components/WizardProgress';
export { WizardStepShell } from './components/WizardStepShell';
export { DocumentUploader } from './components/DocumentUploader';
export { NUMERIC_STEPS, sectionValues } from './wizard/step-config';
export { AssistanceWizard } from './wizard/AssistanceWizard';
export { ProgramIntroScreen } from './screens/ProgramIntroScreen';
export { EligibilityConditionsScreen } from './screens/EligibilityConditionsScreen';
export { PreCheckScreen } from './screens/PreCheckScreen';
