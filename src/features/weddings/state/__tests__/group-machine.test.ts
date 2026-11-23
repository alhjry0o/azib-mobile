import {
  GROUP_STATUSES,
  GROUP_TRANSITIONS,
  assertGroupTransition,
  canGroupTransition,
  isGroupTerminal,
  nextGroupStatuses,
  toGroupStatus,
} from '../group-machine';

describe('group state machine', () => {
  it('accepts every declared transition', () => {
    for (const t of GROUP_TRANSITIONS) {
      expect(canGroupTransition(t.from, t.to, t.actor)).toBe(true);
      expect(assertGroupTransition(t.from, t.to, t.actor).ok).toBe(true);
    }
  });

  it('rejects every undeclared pair', () => {
    let rejected = 0;
    for (const from of GROUP_STATUSES) {
      for (const to of GROUP_STATUSES) {
        if (GROUP_TRANSITIONS.some((t) => t.from === from && t.to === to)) continue;
        rejected += 1;
        const result = assertGroupTransition(from, to);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.meta.code).toBe('INVALID_TRANSITION');
      }
    }
    expect(rejected).toBeGreaterThan(0);
  });

  it('reserves lifecycle control to the organizer', () => {
    expect(canGroupTransition('planning', 'agreed', 'organizer')).toBe(true);
    expect(canGroupTransition('planning', 'agreed', 'co_organizer')).toBe(false);
    expect(nextGroupStatuses('draft', 'organizer')).toEqual(['open', 'cancelled']);
  });

  it('terminal statuses have no outgoing transitions', () => {
    for (const status of ['completed', 'cancelled'] as const) {
      expect(isGroupTerminal(status)).toBe(true);
      expect(nextGroupStatuses(status)).toEqual([]);
    }
  });

  it('maps the legacy closed status onto planning', () => {
    expect(toGroupStatus('closed')).toBe('planning');
    expect(toGroupStatus('agreed')).toBe('agreed');
    expect(toGroupStatus('open')).toBe('open');
  });
});
