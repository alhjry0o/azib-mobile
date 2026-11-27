import {
  TASK_STATUSES,
  TASK_TRANSITIONS,
  assertTaskTransition,
  canTaskTransition,
  isTaskTerminal,
  nextTaskStatuses,
  toTaskWorkflowStatus,
} from '../index';

describe('volunteer task machine', () => {
  it('declares exactly six transitions and accepts all of them', () => {
    expect(TASK_TRANSITIONS.length).toBe(6);
    expect(TASK_STATUSES.length).toBe(6);
    for (const t of TASK_TRANSITIONS) {
      expect(canTaskTransition(t.from, t.to, t.actor)).toBe(true);
      expect(assertTaskTransition(t.from, t.to, t.actor).ok).toBe(true);
    }
  });

  it('rejects every undeclared pair exhaustively', () => {
    let rejected = 0;
    for (const from of TASK_STATUSES) {
      for (const to of TASK_STATUSES) {
        if (TASK_TRANSITIONS.some((t) => t.from === from && t.to === to)) continue;
        rejected += 1;
        const result = assertTaskTransition(from, to);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.meta.code).toBe('INVALID_TRANSITION');
      }
    }
    expect(rejected).toBeGreaterThan(0);
  });

  it('separates volunteer and staff actors', () => {
    expect(canTaskTransition('assigned', 'accepted', 'volunteer')).toBe(true);
    expect(canTaskTransition('assigned', 'cancelled', 'volunteer')).toBe(false);
    expect(canTaskTransition('assigned', 'cancelled', 'staff')).toBe(true);
    expect(canTaskTransition('completed', 'reviewed', 'staff')).toBe(true);
    expect(canTaskTransition('completed', 'reviewed', 'volunteer')).toBe(false);
    expect(nextTaskStatuses('assigned', 'volunteer')).toEqual(['accepted', 'declined']);
  });

  it('closes terminal statuses and maps unknown to assigned', () => {
    for (const status of ['declined', 'reviewed', 'cancelled'] as const) {
      expect(isTaskTerminal(status)).toBe(true);
      expect(nextTaskStatuses(status)).toEqual([]);
    }
    expect(toTaskWorkflowStatus('accepted')).toBe('accepted');
  });
});
