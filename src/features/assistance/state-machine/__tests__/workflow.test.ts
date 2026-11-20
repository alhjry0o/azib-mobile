import {
  WORKFLOW_STATUSES,
  WORKFLOW_TRANSITIONS,
  assertTransition,
  canTransition,
  isTerminal,
  nextStatuses,
  toWorkflowStatus,
  type WorkflowStatus,
} from '../workflow';

describe('workflow machine', () => {
  it('accepts every declared transition', () => {
    for (const transition of WORKFLOW_TRANSITIONS) {
      expect(canTransition(transition.from, transition.to, transition.actor)).toBe(true);
      const result = assertTransition(transition.from, transition.to, transition.actor);
      expect(result.ok).toBe(true);
    }
  });

  it('rejects every pair that is not declared', () => {
    let rejected = 0;
    for (const from of WORKFLOW_STATUSES) {
      for (const to of WORKFLOW_STATUSES) {
        const declared = WORKFLOW_TRANSITIONS.some((t) => t.from === from && t.to === to);
        if (declared) continue;
        rejected += 1;
        expect(canTransition(from, to)).toBe(false);
        const result = assertTransition(from, to);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.meta.code).toBe('INVALID_TRANSITION');
      }
    }
    expect(rejected).toBeGreaterThan(0);
  });

  it('enforces the actor when one is supplied', () => {
    expect(canTransition('in_review', 'approved', 'reviewer')).toBe(true);
    expect(canTransition('in_review', 'approved', 'applicant')).toBe(false);
    expect(canTransition('approved', 'disbursing', 'finance')).toBe(true);
    expect(canTransition('approved', 'disbursing', 'reviewer')).toBe(false);
  });

  it('terminal statuses have no outgoing transitions', () => {
    for (const status of ['completed', 'cancelled'] as const) {
      expect(isTerminal(status)).toBe(true);
      expect(nextStatuses(status)).toEqual([]);
    }
  });

  it('lists the applicant options from draft', () => {
    expect(nextStatuses('draft', 'applicant')).toEqual(['submitted', 'cancelled']);
  });

  it('maps legacy repository statuses onto the workflow vocabulary', () => {
    expect(toWorkflowStatus('reviewing')).toBe('in_review');
    expect(toWorkflowStatus('disbursed')).toBe('disbursing');
    expect(toWorkflowStatus('info_requested')).toBe('info_requested');
  });

  it('covers all eleven workflow statuses in the transition table', () => {
    const touched = new Set<WorkflowStatus>();
    for (const transition of WORKFLOW_TRANSITIONS) {
      touched.add(transition.from);
      touched.add(transition.to);
    }
    for (const status of WORKFLOW_STATUSES) expect(touched.has(status)).toBe(true);
  });
});
