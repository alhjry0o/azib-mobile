import { JobApplicationSchema, JobDraftSchema, JobReportSchema } from '../index';

const draft = {
  title: 'Shop assistant',
  publisherName: 'Demo publisher',
  category: 'retail' as const,
  description: 'A demo retail role with clearly fabricated details for testing.',
  governorateId: 'sanaa',
  districtId: null,
  workType: 'daily' as const,
  schedule: 'part_time' as const,
  salaryMin: 40000,
  salaryMax: 60000,
  requirements: [],
  applicationMethod: 'in_app' as const,
  applicationInstructions: null,
  deadline: null,
  publisherTermsAccepted: true,
};

describe('job draft schema', () => {
  it('accepts a complete draft and requires publisher terms', () => {
    expect(JobDraftSchema.safeParse(draft).success).toBe(true);
    expect(JobDraftSchema.safeParse({ ...draft, publisherTermsAccepted: false }).success).toBe(
      false,
    );
  });

  it('rejects an inverted salary range and unknown categories', () => {
    expect(JobDraftSchema.safeParse({ ...draft, salaryMax: 10000 }).success).toBe(false);
    expect(JobDraftSchema.safeParse({ ...draft, category: 'crypto' }).success).toBe(false);
    expect(JobDraftSchema.safeParse({ ...draft, salaryMin: null, salaryMax: null }).success).toBe(
      true,
    );
  });

  it('rejects fractional salaries and short descriptions', () => {
    expect(JobDraftSchema.safeParse({ ...draft, salaryMin: 10.5 }).success).toBe(false);
    expect(JobDraftSchema.safeParse({ ...draft, description: 'short' }).success).toBe(false);
  });
});

describe('application and report schemas', () => {
  it('requires a headline and a meaningful message', () => {
    const valid = {
      headline: 'Retail experience',
      message: 'I have two years of shop experience and can start immediately.',
    };
    expect(JobApplicationSchema.safeParse(valid).success).toBe(true);
    expect(JobApplicationSchema.safeParse({ ...valid, message: 'hi' }).success).toBe(false);
  });

  it('requires a report reason and detail', () => {
    const valid = {
      jobId: 'j1',
      reasonKey: 'jobs:report.reasons.fake',
      detail: 'The publisher asks for money to schedule an interview.',
    };
    expect(JobReportSchema.safeParse(valid).success).toBe(true);
    expect(JobReportSchema.safeParse({ ...valid, detail: 'short' }).success).toBe(false);
    expect(JobReportSchema.safeParse({ ...valid, reasonKey: '' }).success).toBe(false);
  });
});
