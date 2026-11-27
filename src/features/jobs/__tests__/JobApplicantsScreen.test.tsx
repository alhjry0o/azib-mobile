import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  makeDemoSession,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { applyToJob } from '../services/application-service';
import { createJobDraft, publishJob } from '../services/job-service';
import { DEFAULT_JOB_LIMITS } from '../state/limits';
import { JobApplicantsScreen } from '../screens/JobApplicantsScreen';

let mockId = '';
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({ id: mockId }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

function clientWithSession() {
  const client = createTestQueryClient();
  client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
  return client;
}

describe('JobApplicantsScreen', () => {
  beforeEach(async () => {
    mockId = '';
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  async function setup(publisherId: string) {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <JobApplicantsScreen />
      </ShellProviders>,
    );
    let applicationId = '';
    await act(async () => {
      const repos = container!.repositories;
      const deps = {
        jobs: repos.jobs,
        jobApplications: repos.jobApplications,
        audit: repos.audit,
      };
      const now = new Date();
      const created = await createJobDraft(
        { jobs: repos.jobs, audit: repos.audit },
        {
          publisherId,
          publisherName: 'Demo publisher',
          title: 'Shop assistant',
          category: 'retail',
          description: 'A demo retail role with clearly fabricated details for testing.',
          governorateId: 'sanaa',
          districtId: null,
          workType: 'daily',
          schedule: 'part_time',
          salaryMin: null,
          salaryMax: null,
          requirements: [],
          applicationMethod: 'in_app',
          applicationInstructions: null,
          deadline: null,
          publisherTermsAccepted: true,
        },
        DEFAULT_JOB_LIMITS,
        now,
      );
      if (!created.ok) throw new Error('setup failed');
      mockId = created.value.id;
      await publishJob({ jobs: repos.jobs, audit: repos.audit }, mockId, publisherId, DEFAULT_JOB_LIMITS, now);
      const applied = await applyToJob(
        deps,
        mockId,
        'applicant-1',
        'Retail experience',
        'I have two years of shop experience and can start immediately.',
        'cv-file-1',
        DEFAULT_JOB_LIMITS,
        now,
      );
      if (applied.ok) applicationId = applied.value.id;
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['jobs'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <JobApplicantsScreen />
      </ShellProviders>,
    );
    return { client, view, applicationId };
  }

  it('refuses a viewer who is not the publisher and fetches no applicant', async () => {
    await setup('publisher-1');
    await waitFor(() => {
      expect(screen.getByTestId('job-applicants-forbidden')).toBeTruthy();
    });
    expect(screen.queryByTestId('job-applicants-minimum-note')).toBeNull();
    expect(screen.queryByText('Retail experience')).toBeNull();
  });

  it('shows minimum data, moves the timeline and reads the CV reference', async () => {
    const { applicationId } = await setup('demo-user-test');
    await waitFor(() => {
      expect(screen.getByTestId(`applicant-${applicationId}`)).toBeTruthy();
    });
    expect(screen.getByTestId('job-applicants-minimum-note')).toBeTruthy();
    expect(screen.queryByText('applicant-1')).toBeNull();
    expect(screen.queryByText('cv-file-1')).toBeNull();

    await fireEvent.press(screen.getByTestId(`applicant-cv-${applicationId}`));
    await waitFor(() => {
      expect(screen.getByTestId('job-applicants-cv-reference')).toBeTruthy();
    });

    await fireEvent.press(screen.getByTestId(`applicant-viewed-${applicationId}`));
    await waitFor(() => {
      expect(screen.getByTestId(`applicant-shortlist-${applicationId}`)).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId(`applicant-shortlist-${applicationId}`));
    await waitFor(() => {
      expect(screen.getByTestId(`applicant-hire-${applicationId}`)).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId(`applicant-hire-${applicationId}`));
    await waitFor(() => {
      expect(screen.queryByTestId(`applicant-hire-${applicationId}`)).toBeNull();
    });
    const found = await container!.repositories.jobApplications.getById(applicationId);
    if (found.ok && found.value) expect(found.value.status).toBe('hired');
  });
});
