import type { AmbassadorTask } from '@/repositories/contracts/ambassador';
import type { VolunteerTask } from '@/repositories/contracts/volunteer-task';
import {
  DEFAULT_TASK_FILTERS,
  VOLUNTEER_FORBIDDEN,
  ambassadorTaskToView,
  canReviewTasks,
  canViewTaskRatings,
  canVolunteer,
  filterTaskViews,
  isForbiddenForVolunteer,
  readTaskRatingForStaff,
  validateTaskRating,
  validateTaskReport,
  volunteerTaskToView,
} from '../index';

const baseTask: VolunteerTask = {
  id: 't1',
  volunteerId: 'volunteer-1',
  kind: 'donation_delivery',
  governorateId: 'sanaa',
  titleKey: 'marketplace:volunteers.tasks.delivery',
  status: 'reviewed',
  timelinessScore: 4,
  completionScore: 5,
  ratingNote: 'On time and complete',
  reviewedAt: '2026-06-02T00:00:00.000Z',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-02T00:00:00.000Z',
  dataOrigin: 'demo',
};

describe('volunteer deny-list', () => {
  it('denies every forbidden permission explicitly', () => {
    for (const permission of VOLUNTEER_FORBIDDEN) {
      expect(canVolunteer('volunteer', permission)).toBe(false);
      expect(isForbiddenForVolunteer(permission)).toBe(true);
    }
  });

  it('never reaches financial applications, documents or applicant data', () => {
    expect(canVolunteer('volunteer', 'view_financial_applications')).toBe(false);
    expect(canVolunteer('volunteer', 'view_verification_documents')).toBe(false);
    expect(canVolunteer('volunteer', 'view_beneficiary_data')).toBe(false);
    expect(canVolunteer('volunteer', 'view_job_applicants')).toBe(false);
    expect(canVolunteer('volunteer', 'view_applicant_cv')).toBe(false);
  });

  it('allows field work only', () => {
    expect(canVolunteer('volunteer', 'accept_task')).toBe(true);
    expect(canVolunteer('volunteer', 'complete_task')).toBe(true);
    expect(canVolunteer('volunteer', 'view_own_tasks')).toBe(true);
    expect(canVolunteer('member', 'register_volunteer')).toBe(true);
    expect(canVolunteer('guest', 'accept_task')).toBe(false);
  });

  it('reserves review and ratings to staff', () => {
    expect(canReviewTasks('volunteer')).toBe(false);
    expect(canReviewTasks('moderator')).toBe(true);
    expect(canViewTaskRatings('volunteer')).toBe(false);
    expect(canViewTaskRatings('auditor')).toBe(true);
  });
});

describe('two-axis rating', () => {
  it('accepts 1..5 integers on both axes with a short note', () => {
    const parsed = validateTaskRating({ timeliness: 4, completion: 5, note: '  Good  ' });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.value.note).toBe('Good');
  });

  it('rejects out-of-range, fractional and overlong input', () => {
    expect(validateTaskRating({ timeliness: 0, completion: 3 }).ok).toBe(false);
    expect(validateTaskRating({ timeliness: 3, completion: 6 }).ok).toBe(false);
    expect(validateTaskRating({ timeliness: 3.5, completion: 3 }).ok).toBe(false);
    expect(
      validateTaskRating({ timeliness: 3, completion: 3, note: 'x'.repeat(301) }).ok,
    ).toBe(false);
  });

  it('requires a meaningful completion report', () => {
    expect(validateTaskReport('short').ok).toBe(false);
    expect(validateTaskReport('Delivered the items to the family today.').ok).toBe(true);
    expect(validateTaskReport('x'.repeat(1001)).ok).toBe(false);
  });

  it('is staff-private and deny-by-default', () => {
    const denied = readTaskRatingForStaff(baseTask, 'volunteer');
    expect(denied.ok).toBe(false);
    const staff = readTaskRatingForStaff(baseTask, 'moderator');
    expect(staff.ok).toBe(true);
    if (staff.ok) expect(staff.value?.timeliness).toBe(4);
    const unrated = readTaskRatingForStaff({ ...baseTask, timelinessScore: null }, 'admin');
    expect(unrated.ok).toBe(true);
    if (unrated.ok) expect(unrated.value).toBeNull();
  });
});

describe('shared task display projection (no domain merge)', () => {
  const ambassador: AmbassadorTask = {
    id: 'a1',
    ambassadorId: 'ambassador-1',
    kind: 'nominate_partner',
    governorateId: 'aden',
    titleKey: 'marketplace:ambassador.taskNominate',
    status: 'assigned',
    photoFileIds: [],
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    dataOrigin: 'demo',
  };

  it('normalises both sources into one view shape', () => {
    const volunteerView = volunteerTaskToView({ ...baseTask, status: 'assigned' });
    const ambassadorView = ambassadorTaskToView(ambassador);
    expect(volunteerView.source).toBe('volunteer');
    expect(ambassadorView.source).toBe('ambassador');
    expect(Object.keys(volunteerView).sort()).toEqual(Object.keys(ambassadorView).sort());
    expect(volunteerView.actionable).toBe(true);
    expect(ambassadorView.actionable).toBe(true);
  });

  it('filters the unified board by region, source and actionability', () => {
    const views = [
      volunteerTaskToView({ ...baseTask, status: 'assigned' }),
      ambassadorTaskToView(ambassador),
    ];
    expect(filterTaskViews(views, DEFAULT_TASK_FILTERS).length).toBe(2);
    expect(
      filterTaskViews(views, { ...DEFAULT_TASK_FILTERS, governorateId: 'aden' }).map(
        (v) => v.source,
      ),
    ).toEqual(['ambassador']);
    expect(
      filterTaskViews(views, { ...DEFAULT_TASK_FILTERS, source: 'volunteer' }).length,
    ).toBe(1);
    expect(
      filterTaskViews(views, { ...DEFAULT_TASK_FILTERS, actionableOnly: true }).length,
    ).toBe(2);
  });
});
