import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { Volunteer, VolunteerRepository } from '@/repositories/contracts/volunteer';
import { VolunteerRegistrationSchema } from '../schemas';
import { normalizeAvailability } from '../state/availability';

export interface VolunteerRegistrationDeps {
  readonly volunteers: VolunteerRepository;
  readonly audit: AuditRepository;
}

export interface RegisterVolunteerInput {
  readonly userId: string;
  readonly skillKey: string;
  readonly governorateIds: readonly string[];
  readonly skills: readonly string[];
  readonly helpTypes: readonly ('donation_delivery' | 'wedding_coordination' | 'partner_visits')[];
  readonly availability: readonly boolean[];
  readonly note: string | null;
}

export async function registerVolunteer(
  deps: VolunteerRegistrationDeps,
  input: RegisterVolunteerInput,
): Promise<Result<Volunteer>> {
  if (!input.userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  const parsed = VolunteerRegistrationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: AppError.validation({ cause: parsed.error }) };
  }
  const listed = await deps.volunteers.list({ limit: 200 });
  if (!listed.ok) return listed;
  const existing = listed.value.items.find((v) => v.userId === input.userId) ?? null;

  if (existing) {
    const updated = await deps.volunteers.update(existing.id, {
      skillKey: parsed.data.skillKey,
      governorateIds: parsed.data.governorateIds,
      skills: parsed.data.skills,
      helpTypes: parsed.data.helpTypes,
      availability: normalizeAvailability(parsed.data.availability),
      note: parsed.data.note,
      status: 'active',
    });
    if (!updated.ok) return updated;
    await deps.audit.append({
      actorId: input.userId,
      action: 'volunteer.profile.updated',
      target: `volunteer:${existing.id}`,
    });
    return ok(updated.value);
  }

  const created = await deps.volunteers.create({
    userId: input.userId,
    skillKey: parsed.data.skillKey,
    governorateIds: parsed.data.governorateIds,
    skills: parsed.data.skills,
    helpTypes: parsed.data.helpTypes,
    availability: normalizeAvailability(parsed.data.availability),
    note: parsed.data.note,
  });
  if (!created.ok) return created;
  await deps.audit.append({
    actorId: input.userId,
    action: 'volunteer.registered',
    target: `volunteer:${created.value.id}`,
  });
  return ok(created.value);
}
