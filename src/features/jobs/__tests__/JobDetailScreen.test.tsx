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
import { createJobDraft, publishJob } from '../services/job-service';
import { DEFAULT_JOB_LIMITS } from '../state/limits';
import { JobDetailScreen } from '../screens/JobDetailScreen';

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

async function seed(publisherId: string): Promise<string> {
  const deps = {
    jobs: container!.repositories.jobs,
    audit: container!.repositories.audit,
  };
  const now = new Date();
  const created = await createJobDraft(
    deps,
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
      salaryMin: 40000,
      salaryMax: 60000,
      requirements: ['Basic numeracy'],
      applicationMethod: 'in_app',
      applicationInstructions: null,
      deadline: null,
      publisherTermsAccepted: true,
    },
    DEFAULT_JOB_LIMITS,
    now,
  );
  if (!created.ok) throw new Error('setup failed');
  await publishJob(deps, created.value.id, publisherId, DEFAULT_JOB_LIMITS, now);
  return created.value.id;
}

describe('JobDetailScreen', () => {
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
        <JobDetailScreen />
      </ShellProviders>,
    );
    await act(async () => {
      mockId = await seed(publisherId);
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['jobs'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <JobDetailScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('job-detail-card')).toBeTruthy();
    });
    return { client, view };
  }

  it('labels the salary and publisher as unverified and never shows publisherId', async () => {
    await setup('publisher-1');
    expect(screen.getByTestId('job-detail-salary-unverified')).toBeTruthy();
    expect(screen.getByTestId('job-detail-unverified-publisher')).toBeTruthy();
    expect(screen.getByTestId('job-detail-requirements')).toBeTruthy();
    expect(screen.queryByText('publisher-1')).toBeNull();
    expect(screen.getByTestId('job-detail-apply')).toBeTruthy();
  });

  it('saves and unsaves the job for a signed-in member', async () => {
    await setup('publisher-1');
    await fireEvent.press(screen.getByTestId('job-detail-save'));
    await waitFor(() => {
      expect(screen.queryByTestId('job-detail-action-error')).toBeNull();
    });
    const saved = await container!.repositories.jobEngagement.listSaved('demo-user-test');
    expect(saved.ok).toBe(true);
    if (saved.ok) expect(saved.value.length).toBe(1);
  });

  it('shows the applicants entry to the publisher instead of apply', async () => {
    await setup('demo-user-test');
    expect(screen.getByTestId('job-detail-applicants')).toBeTruthy();
    expect(screen.queryByTestId('job-detail-apply')).toBeNull();
  });
});
