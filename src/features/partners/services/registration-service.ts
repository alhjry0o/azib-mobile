// Partner registration and re-submission. The crown is never granted here:
// only a verification record decided by a verifier can do that.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { Partner, PartnerRepository } from '@/repositories/contracts/partner';
import type { PartnerVerificationRepository } from '@/repositories/contracts/partner-verification';
import { cleanYemeniPhone } from '../lib/phone';
import { PartnerRegistrationSchema } from '../schemas/registration';
import { assertPartnerTransition, toPartnerWorkflowStatus } from '../state/partner-machine';

export interface RegistrationDeps {
  readonly partners: PartnerRepository;
  readonly verifications: PartnerVerificationRepository;
  readonly audit: AuditRepository;
}

export interface RegisterPartnerInput {
  readonly ownerId: string;
  readonly displayName: string;
  readonly category: string;
  readonly description: string;
  readonly governorateId: string;
  readonly districtId: string | null;
  readonly city: string | null;
  readonly contactPhone: string;
  readonly whatsapp: string | null;
  readonly imageFileIds: readonly string[];
  readonly documentFileIds: readonly string[];
  readonly termsAccepted: boolean;
}

export async function registerPartner(
  deps: RegistrationDeps,
  input: RegisterPartnerInput,
): Promise<Result<Partner>> {
  if (!input.ownerId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  const parsed = PartnerRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: AppError.validation({ cause: parsed.error }) };
  }
  const phone = cleanYemeniPhone(parsed.data.contactPhone);
  if (!phone.ok) return phone;
  let whatsapp: string | null = null;
  if (parsed.data.whatsapp && parsed.data.whatsapp.trim().length > 0) {
    const cleaned = cleanYemeniPhone(parsed.data.whatsapp);
    if (!cleaned.ok) return cleaned;
    whatsapp = cleaned.value.e164;
  } else {
    whatsapp = phone.value.e164;
  }

  const created = await deps.partners.create({
    displayName: parsed.data.displayName,
    category: parsed.data.category,
    description: parsed.data.description,
    ownerId: input.ownerId,
    governorateId: parsed.data.governorateId,
    districtId: parsed.data.districtId,
    city: parsed.data.city,
    contactPhone: phone.value.e164,
    whatsapp,
    imageFileIds: parsed.data.imageFileIds,
    termsAcceptedAt: new Date().toISOString(),
  });
  if (!created.ok) return created;

  const submitted = await deps.verifications.submit({
    partnerId: created.value.id,
    submittedBy: input.ownerId,
    documentFileIds: parsed.data.documentFileIds,
  });
  if (!submitted.ok) return submitted;

  const moved = await deps.partners.update(created.value.id, {
    status: 'pending_verification',
    verificationId: submitted.value.id,
  });
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId: input.ownerId,
    action: 'partner.registered',
    target: `partner:${created.value.id}`,
    meta: { to: 'pending_verification' },
  });
  return ok(moved.value);
}

export async function resubmitVerification(
  deps: RegistrationDeps,
  partnerId: string,
  ownerId: string,
  documentFileIds: readonly string[],
): Promise<Result<Partner>> {
  if (documentFileIds.length === 0) {
    return { ok: false, error: AppError.validation({ code: 'DOCUMENTS_REQUIRED' }) };
  }
  const found = await deps.partners.getById(partnerId);
  if (!found.ok) return found;
  const partner = found.value;
  if (!partner) return { ok: false, error: AppError.notFound({ code: 'PARTNER_NOT_FOUND' }) };
  if (partner.ownerId !== ownerId) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_PARTNER_OWNER' }) };
  }
  const from = toPartnerWorkflowStatus(partner.status);
  const allowed = assertPartnerTransition(from, 'pending_verification', 'partner_owner');
  if (!allowed.ok) return allowed;

  const submitted = await deps.verifications.submit({
    partnerId,
    submittedBy: ownerId,
    documentFileIds,
  });
  if (!submitted.ok) return submitted;
  const moved = await deps.partners.update(partnerId, {
    status: 'pending_verification',
    verificationId: submitted.value.id,
    rejectionReasonKey: null,
  });
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId: ownerId,
    action: 'partner.verification.resubmitted',
    target: `partner:${partnerId}`,
    meta: { from, to: 'pending_verification' },
  });
  return ok(moved.value);
}
