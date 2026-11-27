import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAppModeStore } from '@/stores';
import { createJobDraft, publishJob } from '../services/job-service';
import { DEFAULT_JOB_LIMITS } from '../state/limits';
import { JobBrowserScreen } from '../screens/JobBrowserScreen';

const mockPush = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), navigate: jest.fn() }),
}));

jest.mock('@/components/ui/form/Select', () => ({
  Select: () => null,
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

const jobInput = {
  publisherId: 'publisher-1',
  publisherName: 'Demo publisher',
  title: 'Shop assistant',
  category: 'retail',
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

async function seedJob(title: string, category: string): Promise<string> {
  const deps = {
    jobs: container!.repositories.jobs,
    audit: container!.repositories.audit,
  };
  const now = new Date();
  const created = await createJobDraft(
    deps,
    { ...jobInput, title, category },
    DEFAULT_JOB_LIMITS,
    now,
  );
  if (!created.ok) throw new Error('setup failed');
  await publishJob(deps, created.value.id, 'publisher-1', DEFAULT_JOB_LIMITS, now);
  return created.value.id;
}

describe('JobBrowserScreen', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    container = null;
    await resetShellStores();
  });

  it('shows the unverified-salary note and an honest empty state', async () => {
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <JobBrowserScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('jobs-salary-note')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId('jobs-empty')).toBeTruthy();
    });
  });

  it('lists a published job with the unverified salary label and opens it', async () => {
    const client = createTestQueryClient();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <JobBrowserScreen />
      </ShellProviders>,
    );
    let id = '';
    await act(async () => {
      id = await seedJob('Shop assistant', 'retail');
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['jobs'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <JobBrowserScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId(`job-card-${id}`)).toBeTruthy();
    });
    expect(screen.getByTestId(`job-salary-${id}-unverified`)).toBeTruthy();
    expect(screen.queryByText('publisher-1')).toBeNull();
    await fireEvent.press(screen.getByTestId(`job-open-${id}`));
    expect(mockPush).toHaveBeenCalledWith(`/jobs/${id}`);
  });

  it('filters by category and by salary floor, then clears', async () => {
    const client = createTestQueryClient();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <JobBrowserScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await seedJob('Shop assistant', 'retail');
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['jobs'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <JobBrowserScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('jobs-category-education')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('jobs-category-education'));
    await waitFor(() => {
      expect(screen.getByTestId('jobs-empty')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('jobs-clear-filters'));
    await waitFor(() => {
      expect(screen.queryByTestId('jobs-empty')).toBeNull();
    });
    await fireEvent.changeText(screen.getByTestId('jobs-salary-floor'), '90000');
    await waitFor(() => {
      expect(screen.getByTestId('jobs-empty')).toBeTruthy();
    });
  });

  it('shows NotConnected in backend mode', async () => {
    await act(() => {
      useAppModeStore.setState({ mode: 'backend', hydrated: true });
    });
    await render(
      <ShellProviders client={createTestQueryClient()}>
        <Probe />
        <JobBrowserScreen />
      </ShellProviders>,
    );
    expect(screen.queryByTestId('jobs-search')).toBeNull();
    expect(screen.getByTestId('jobs-screen')).toBeTruthy();
  });
});
