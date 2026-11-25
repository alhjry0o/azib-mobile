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
import {
  createAmbassadorTask,
  decideAmbassadorApplication,
} from '../services/ambassador-service';
import { AmbassadorScreen } from '../screens/AmbassadorScreen';

let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn(), navigate: jest.fn() }),
}));

jest.mock('@/components/ui/form/Select', () => ({
  Select: ({
    value,
    onChange,
    options,
    testID,
  }: {
    value: string | null;
    onChange: (v: string) => void;
    options: readonly { value: string; label: string }[];
    testID?: string;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pressable, Text } = require('react-native');
    const first = options[0];
    return (
      <Pressable testID={testID} onPress={() => first && onChange(first.value)}>
        <Text>{value ?? 'none'}</Text>
      </Pressable>
    );
  },
}));

jest.mock('../services/media-service', () => ({
  pickPrepareUploadMedia: async () => ({
    ok: true as const,
    value: {
      fileId: 'photo-1',
      fileName: 'p.jpg',
      mimeType: 'image/jpeg',
      size: 1000,
      sha256: 'b'.repeat(64),
    },
  }),
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

describe('AmbassadorScreen', () => {
  beforeEach(async () => {
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  it('states the privacy boundary and submits an application', async () => {
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <AmbassadorScreen />
      </ShellProviders>,
    );
    expect(screen.getByTestId('ambassador-privacy-note')).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId('ambassador-apply-form')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('ambassador-region'));
    await fireEvent.changeText(
      screen.getByTestId('ambassador-motivation'),
      'I can nominate partners across my region.',
    );
    await fireEvent.press(screen.getByTestId('ambassador-apply'));
    await waitFor(() => {
      expect(screen.getByTestId('ambassador-application')).toBeTruthy();
    });
    expect(screen.queryByTestId('ambassador-tasks-empty')).toBeNull();
  });

  it('shows assigned tasks only after approval and submits evidence', async () => {
    const client = clientWithSession();
    const view = await render(
      <ShellProviders client={client}>
        <Probe />
        <AmbassadorScreen />
      </ShellProviders>,
    );
    let taskId = '';
    await act(async () => {
      const repos = container!.repositories;
      const deps = { ambassadors: repos.ambassadors, audit: repos.audit };
      const applied = await repos.ambassadors.apply({
        userId: 'demo-user-test',
        governorateIds: ['sanaa'],
        motivation: 'I can nominate partners across my region.',
      });
      if (!applied.ok) throw new Error('setup failed');
      await decideAmbassadorApplication(deps, applied.value.id, 'admin', 'admin-1', 'approved');
      const task = await createAmbassadorTask(
        deps,
        'admin',
        'admin-1',
        'demo-user-test',
        'nominate_partner',
        'sanaa',
        'marketplace:ambassador.taskNominate',
      );
      if (task.ok) taskId = task.value.id;
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['partners'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <AmbassadorScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId(`ambassador-task-${taskId}`)).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('ambassador-photos-pick-image'));
    await waitFor(() => {
      expect(screen.getByTestId('ambassador-photos-remove-photo-1')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId(`ambassador-submit-${taskId}`));
    await waitFor(() => {
      expect(screen.queryByTestId(`ambassador-submit-${taskId}`)).toBeNull();
    });
    const tasks = await container!.repositories.ambassadors.listTasks('demo-user-test');
    if (tasks.ok) expect(tasks.value[0]?.status).toBe('submitted');
  });
});
