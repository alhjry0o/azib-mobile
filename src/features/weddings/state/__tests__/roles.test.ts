import { can, isOrganizerOnly, toPublicGroupView } from '../roles';

describe('group roles', () => {
  it('organizer can do everything', () => {
    expect(can('organizer', 'cancel_group')).toBe(true);
    expect(can('organizer', 'mute_member')).toBe(true);
    expect(can('organizer', 'adopt_budget')).toBe(true);
  });

  it('co-organizer helps but cannot cancel, mute or adopt', () => {
    expect(can('co_organizer', 'approve_join')).toBe(true);
    expect(can('co_organizer', 'edit_budget')).toBe(true);
    expect(can('co_organizer', 'cancel_group')).toBe(false);
    expect(can('co_organizer', 'mute_member')).toBe(false);
    expect(can('co_organizer', 'adopt_budget')).toBe(false);
  });

  it('member participates but does not administer', () => {
    expect(can('member', 'vote')).toBe(true);
    expect(can('member', 'approve_share')).toBe(true);
    expect(can('member', 'send_message')).toBe(true);
    expect(can('member', 'approve_join')).toBe(false);
    expect(can('member', 'edit_budget')).toBe(false);
    expect(can('member', 'remove_message')).toBe(false);
  });

  it('marks the organizer-only permissions', () => {
    expect(isOrganizerOnly('mute_member')).toBe(true);
    expect(isOrganizerOnly('invite')).toBe(false);
  });
});

describe('public group view', () => {
  it('never exposes member identities or an exact date', () => {
    const view = toPublicGroupView({
      titleKey: 'weddings:demo.title',
      governorateId: 'sanaa',
      districtId: 'maeen',
      memberCount: 5,
      scheduledDate: '2026-06-15T16:00:00.000Z',
    });
    expect(view.approximateDate).toBe('2026-06');
    expect(JSON.stringify(view)).not.toContain('seed-user');
    expect(Object.keys(view).sort()).toEqual([
      'approximateDate',
      'districtId',
      'governorateId',
      'memberCount',
      'titleKey',
    ]);
  });
});
