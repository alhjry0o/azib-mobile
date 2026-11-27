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
import { JobComposerScreen } from '../screens/JobComposerScreen';

const mockReplace = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
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

jest.mock('@/components/ui/form/DatePicker', () => ({
  DatePicker: () => null,
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

describe('JobComposerScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
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
        <JobComposerScreen />
      </ShellProviders>,
    );
    return { client, view };
  }

  it('states the unverified-publisher rule and blocks an empty submission', async () => {
    await setup();
    expect(screen.getByTestId('job-composer-unverified-note')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('job-composer-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('job-composer-error')).toBeTruthy();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('publishes a valid job and navigates to its details', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('job-composer-title'), 'Shop assistant');
    await fireEvent.changeText(screen.getByTestId('job-composer-publisher'), 'Demo publisher');
    await fireEvent.changeText(
      screen.getByTestId('job-composer-description'),
      'A demo retail role with clearly fabricated details for testing.',
    );
    await fireEvent.press(screen.getByTestId('job-composer-governorate'));
    await fireEvent.press(screen.getByTestId('job-composer-terms'));
    await fireEvent.press(screen.getByTestId('job-composer-submit'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });
    const listed = await container!.repositories.jobs.list();
    expect(listed.ok).toBe(true);
    if (listed.ok) {
      expect(listed.value.total).toBe(1);
      expect(listed.value.items[0]?.status).toBe('open');
      expect(listed.value.items[0]?.publisherId).toBe('demo-user-test');
    }
  });

  it('routes through review when settings enable it', async () => {
    const { client, view } = await setup();
    await act(async () => {
      await container!.repositories.settings.update('system_settings', { jobRequireReview: true });
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['jobs'] });
    });
    await view.rerender(
      <ShellProviders client={client}>
        <Probe />
        <JobComposerScreen />
      </ShellProviders>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('job-composer-review-enabled')).toBeTruthy();
    });
    await fireEvent.changeText(screen.getByTestId('job-composer-title'), 'Reviewed role');
    await fireEvent.changeText(screen.getByTestId('job-composer-publisher'), 'Demo publisher');
    await fireEvent.changeText(
      screen.getByTestId('job-composer-description'),
      'A demo retail role with clearly fabricated details for testing.',
    );
    await fireEvent.press(screen.getByTestId('job-composer-governorate'));
    await fireEvent.press(screen.getByTestId('job-composer-terms'));
    await fireEvent.press(screen.getByTestId('job-composer-submit'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });
    const listed = await container!.repositories.jobs.list();
    if (listed.ok) expect(listed.value.items[0]?.status).toBe('pending_review');
  });
});
