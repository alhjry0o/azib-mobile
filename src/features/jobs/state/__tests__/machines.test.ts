import {
  APPLICATION_STATUSES,
  APPLICATION_TRANSITIONS,
  JOB_STATUSES,
  JOB_TRANSITIONS,
  assertApplicationTransition,
  assertJobTransition,
  buildTimeline,
  canApplicationTransition,
  canJobTransition,
  isActiveApplicationStatus,
  isApplicationTerminal,
  isClientWritableJobStatus,
  nextApplicationStatuses,
  nextJobStatuses,
  toApplicationWorkflowStatus,
  toJobWorkflowStatus,
} from '../index';

describe('job machine', () => {
  it('declares exactly nine transitions and accepts all of them', () => {
    expect(JOB_TRANSITIONS.length).toBe(9);
    expect(JOB_STATUSES.length).toBe(6);
    for (const t of JOB_TRANSITIONS) {
      expect(canJobTransition(t.from, t.to, t.actor)).toBe(true);
      expect(assertJobTransition(t.from, t.to, t.actor).ok).toBe(true);
    }
  });

  it('rejects every undeclared pair exhaustively', () => {
    let rejected = 0;
    for (const from of JOB_STATUSES) {
      for (const to of JOB_STATUSES) {
        if (JOB_TRANSITIONS.some((t) => t.from === from && t.to === to)) continue;
        rejected += 1;
        const result = assertJobTransition(from, to);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.error.meta.code).toBe('INVALID_TRANSITION');
      }
    }
    expect(rejected).toBeGreaterThan(0);
  });

  it('enforces the actor and never lets the client write expired', () => {
    expect(canJobTransition('pending_review', 'open', 'moderator')).toBe(true);
    expect(canJobTransition('pending_review', 'open', 'publisher')).toBe(false);
    expect(canJobTransition('open', 'expired', 'system')).toBe(true);
    expect(canJobTransition('open', 'expired', 'publisher')).toBe(false);
    expect(isClientWritableJobStatus('expired')).toBe(false);
    expect(isClientWritableJobStatus('open')).toBe(true);
  });

  it('maps legacy statuses and allows relisting', () => {
    expect(toJobWorkflowStatus('draft')).toBe('draft');
    expect(toJobWorkflowStatus('open')).toBe('open');
    expect(toJobWorkflowStatus('closed')).toBe('closed');
    expect(nextJobStatuses('expired', 'publisher')).toEqual(['draft']);
    expect(nextJobStatuses('rejected', 'publisher')).toEqual(['draft']);
  });
});

describe('application machine', () => {
  it('declares exactly ten transitions and accepts all of them', () => {
    expect(APPLICATION_TRANSITIONS.length).toBe(10);
    expect(APPLICATION_STATUSES.length).toBe(6);
    for (const t of APPLICATION_TRANSITIONS) {
      expect(canApplicationTransition(t.from, t.to, t.actor)).toBe(true);
      expect(assertApplicationTransition(t.from, t.to, t.actor).ok).toBe(true);
    }
  });

  it('rejects every undeclared pair exhaustively', () => {
    let rejected = 0;
    for (const from of APPLICATION_STATUSES) {
      for (const to of APPLICATION_STATUSES) {
        if (APPLICATION_TRANSITIONS.some((t) => t.from === from && t.to === to)) continue;
        rejected += 1;
        expect(assertApplicationTransition(from, to).ok).toBe(false);
      }
    }
    expect(rejected).toBeGreaterThan(0);
  });

  it('separates applicant and employer actors', () => {
    expect(canApplicationTransition('submitted', 'withdrawn', 'applicant')).toBe(true);
    expect(canApplicationTransition('submitted', 'withdrawn', 'employer')).toBe(false);
    expect(canApplicationTransition('shortlisted', 'hired', 'employer')).toBe(true);
    expect(canApplicationTransition('shortlisted', 'hired', 'applicant')).toBe(false);
    expect(nextApplicationStatuses('submitted', 'employer')).toEqual([
      'viewed',
      'shortlisted',
      'rejected',
    ]);
  });

  it('frees an active slot on withdrawal and closes terminals', () => {
    expect(isActiveApplicationStatus('submitted')).toBe(true);
    expect(isActiveApplicationStatus('viewed')).toBe(true);
    expect(isActiveApplicationStatus('shortlisted')).toBe(true);
    expect(isActiveApplicationStatus('withdrawn')).toBe(false);
    for (const status of ['rejected', 'hired', 'withdrawn'] as const) {
      expect(isApplicationTerminal(status)).toBe(true);
      expect(nextApplicationStatuses(status)).toEqual([]);
    }
    expect(toApplicationWorkflowStatus('submitted')).toBe('submitted');
  });

  it('builds a timeline only from real stamps, sorted', () => {
    const timeline = buildTimeline({
      submittedAt: '2026-06-01T00:00:00.000Z',
      viewedAt: '2026-06-02T00:00:00.000Z',
      shortlistedAt: null,
      hiredAt: '2026-06-05T00:00:00.000Z',
    });
    expect(timeline.map((s) => s.status)).toEqual(['submitted', 'viewed', 'hired']);
    expect(buildTimeline({ submittedAt: '2026-06-01T00:00:00.000Z' }).length).toBe(1);
  });
});
