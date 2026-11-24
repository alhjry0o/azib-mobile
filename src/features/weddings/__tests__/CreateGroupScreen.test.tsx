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
import { CreateGroupScreen } from '../screens/CreateGroupScreen';

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
  DatePicker: ({
    onChange,
    testID,
  }: {
    onChange: (d: Date | null) => void;
    testID?: string;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable testID={testID} onPress={() => onChange(new Date('2026-06-15T16:00:00.000Z'))}>
        <Text>pick</Text>
      </Pressable>
    );
  },
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

describe('CreateGroupScreen', () => {
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
        <CreateGroupScreen />
      </ShellProviders>,
    );
    return { client, view };
  }

  it('blocks advancing without a name and shows the provisional ceiling', async () => {
    await setup();
    expect(screen.getByTestId('create-group-max-note')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('create-group-next'));
    await waitFor(() => {
      expect(screen.getByTestId('create-step-basics')).toBeTruthy();
    });
    expect(screen.queryByTestId('create-step-schedule')).toBeNull();
  });

  it('creates a group through all three steps', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('group-title'), 'Sanaa batch');
    await fireEvent.press(screen.getByTestId('group-governorate'));
    await fireEvent.press(screen.getByTestId('create-group-next'));
    await waitFor(() => {
      expect(screen.getByTestId('create-step-schedule')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('group-date'));
    await fireEvent.changeText(screen.getByTestId('group-target-count'), '6');
    await fireEvent.press(screen.getByTestId('create-group-next'));
    await waitFor(() => {
      expect(screen.getByTestId('create-step-review')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('group-withdrawal-consent'));
    await fireEvent.press(screen.getByTestId('create-group-submit'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });
    const listed = await container!.repositories.weddings.list();
    if (listed.ok) expect(listed.value.total).toBe(1);
  });

  it('rejects a target count above the configured ceiling', async () => {
    const client = clientWithSession();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <CreateGroupScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await container!.repositories.settings.update('system_settings', { maxGroupSize: 4 });
    });
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['weddings'] });
    });
    await fireEvent.changeText(screen.getByTestId('group-title'), 'Small batch');
    await fireEvent.press(screen.getByTestId('group-governorate'));
    await fireEvent.press(screen.getByTestId('create-group-next'));
    await waitFor(() => {
      expect(screen.getByTestId('create-step-schedule')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('group-date'));
    await fireEvent.changeText(screen.getByTestId('group-target-count'), '9');
    await fireEvent.press(screen.getByTestId('create-group-next'));
    await waitFor(() => {
      expect(screen.getByTestId('create-step-schedule')).toBeTruthy();
    });
    expect(screen.queryByTestId('create-step-review')).toBeNull();
  });
});
