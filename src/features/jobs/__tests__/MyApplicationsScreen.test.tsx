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
import { MyApplicationsScreen } from '../screens/MyApplicationsScreen';

let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), navigate: jest.fn() }),
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

describe('MyApplicationsScreen', () => {
  beforeEach(async () => {
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('shows an honest empty state', async () => {
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <MyApplicationsScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('my-applications-empty')).toBeTruthy();
    });
  });

  it('renders a real timeline and withdraws the application', async () => {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <MyApplicationsScreen />
      </ShellProviders>,
    );
    let applicationId = '';
    await act(async () => {
      const repos = container!.repositories;
      const jobDeps = { jobs: repos.jobs, audit: repos.audit };
      const now = new Date();
      const created = await createJobDraft(
        jobDeps,
        {
          publisherId: 'publisher-1',
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
      await publishJob(jobDeps, created.value.id, 'publisher-1', DEFAULT_JOB_LIMITS, now);
      const applied = await applyToJob(
        { jobs: repos.jobs, jobApplications: repos.jobApplications, audit: repos.audit },
        created.value.id,
        'demo-user-test',
        'Retail experience',
        'I have two years of shop experience and can start immediately.',
        null,
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
        <MyApplicationsScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId(`my-application-${applicationId}`)).toBeTruthy();
    });
    expect(screen.getByTestId(`my-application-timeline-${applicationId}-submitted`)).toBeTruthy();
    await fireEvent.press(screen.getByTestId(`my-application-withdraw-${applicationId}`));
    await waitFor(() => {
      expect(screen.queryByTestId(`my-application-withdraw-${applicationId}`)).toBeNull();
    });
    const found = await container!.repositories.jobApplications.getById(applicationId);
    if (found.ok && found.value) {
      expect(found.value.status).toBe('withdrawn');
      expect(found.value.withdrawnAt).toBeTruthy();
    }
  });
});
