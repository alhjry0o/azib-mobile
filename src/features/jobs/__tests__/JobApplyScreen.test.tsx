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
import { JobApplyScreen } from '../screens/JobApplyScreen';

const mockReplace = jest.fn();
let mockId = '';
let container: ProviderContainer | null = null;
const mockUploadCv = jest.fn(async (_storage: unknown, _source: 'image' | 'pdf') => ({
  ok: true as const,
  value: {
    fileId: 'cv-file-1',
    fileName: 'cv.pdf',
    mimeType: 'application/pdf',
    size: 1000,
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({ id: mockId }),
}));

jest.mock('../services/cv-service', () => ({
  pickPrepareUploadCv: (storage: unknown, source: 'image' | 'pdf') =>
    mockUploadCv(storage, source),
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

describe('JobApplyScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    mockUploadCv.mockClear();
    mockId = '';
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  async function setup() {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <JobApplyScreen />
      </ShellProviders>,
    );
    await act(async () => {
      const deps = {
        jobs: container!.repositories.jobs,
        audit: container!.repositories.audit,
      };
      const now = new Date();
      const created = await createJobDraft(
        deps,
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
      mockId = created.value.id;
      await publishJob(deps, mockId, 'publisher-1', DEFAULT_JOB_LIMITS, now);
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['jobs'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <JobApplyScreen />
      </ShellProviders>,
    );
    return { client, view };
  }

  it('states the privacy rule and requires a meaningful message', async () => {
    await setup();
    expect(screen.getByTestId('job-apply-privacy')).toBeTruthy();
    await fireEvent.changeText(screen.getByTestId('job-apply-headline'), 'Retail experience');
    await fireEvent.changeText(screen.getByTestId('job-apply-message'), 'hi');
    await fireEvent.press(screen.getByTestId('job-apply-submit'));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('uploads a private CV and submits the application', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('job-apply-headline'), 'Retail experience');
    await fireEvent.changeText(
      screen.getByTestId('job-apply-message'),
      'I have two years of shop experience and can start immediately.',
    );
    await fireEvent.press(screen.getByTestId('job-apply-cv-pdf'));
    await waitFor(() => {
      expect(mockUploadCv).toHaveBeenCalled();
    });
    expect(screen.getByTestId('job-apply-cv-remove')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('job-apply-submit'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/jobs/applications');
    });
    const mine = await container!.repositories.jobApplications.listByApplicant('demo-user-test');
    expect(mine.ok).toBe(true);
    if (mine.ok) {
      expect(mine.value.length).toBe(1);
      expect(mine.value[0]?.cvFileId).toBe('cv-file-1');
    }
  });
});
