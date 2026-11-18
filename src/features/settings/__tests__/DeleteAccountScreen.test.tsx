import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { translate } from '@/i18n';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { DELETION_PHRASE } from '@/schemas/security';
import { useAuthStore } from '@/stores';
import { DeleteAccountScreen } from '../screens/DeleteAccountScreen';

const mockReplace = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return <View testID={`redirect:${href}`} />;
  },
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

describe('DeleteAccountScreen', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
    });
  });

  async function setup() {
    const client = createTestQueryClient();
    await render(
      <ShellProviders client={client}>
        <Probe />
        <DeleteAccountScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await container!.auth.signIn({ email: 'delete@azib.invalid', password: 'pass1234' });
      const session = await container!.auth.getSession();
      client.setQueryData(sessionQueryKey('demo'), session);
    });
    await waitFor(() => {
      expect(screen.getByTestId('deletion-step-explain')).toBeTruthy();
    });
    return client;
  }

  async function fillConfirmation(password: string) {
    await fireEvent.press(screen.getByTestId('deletion-continue'));
    await fireEvent.changeText(screen.getByTestId('deletion-password'), password);
    await fireEvent.changeText(screen.getByTestId('deletion-phrase'), DELETION_PHRASE);
    await fireEvent.press(screen.getByTestId('deletion-ack'));
    await fireEvent.press(screen.getByTestId('deletion-submit'));
  }

  it('explains what is deleted, anonymized, and retained', async () => {
    await setup();
    expect(screen.getByTestId('deletion-impact-deleted')).toBeTruthy();
    expect(screen.getByTestId('deletion-impact-anonymized')).toBeTruthy();
    expect(screen.getByTestId('deletion-impact-retained')).toBeTruthy();
    expect(screen.getByTestId('deletion-policy-pending')).toBeTruthy();
  });

  it('requires the confirmation word before scheduling', async () => {
    await setup();
    await fireEvent.press(screen.getByTestId('deletion-continue'));
    await fireEvent.changeText(screen.getByTestId('deletion-password'), 'pass1234');
    await fireEvent.changeText(screen.getByTestId('deletion-phrase'), 'wrong');
    await fireEvent.press(screen.getByTestId('deletion-ack'));
    await fireEvent.press(screen.getByTestId('deletion-submit'));
    await waitFor(() => {
      expect(screen.getByText(translate('auth:validation.deletionPhraseMismatch'))).toBeTruthy();
    });
    expect(screen.queryByTestId('deletion-scheduled', { includeHiddenElements: true })).toBeNull();
  });

  it('schedules deletion after re-authentication and allows cancelling', async () => {
    await setup();
    await fillConfirmation('pass1234');
    await waitFor(() => {
      expect(screen.getByTestId('deletion-scheduled')).toBeTruthy();
    });
    expect(screen.getByTestId('deletion-scheduled-for')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('deletion-cancel'));
    await waitFor(() => {
      expect(screen.getByTestId('deletion-step-explain')).toBeTruthy();
    });
  });

  it('rejects a wrong password with an honest error', async () => {
    await setup();
    await fillConfirmation('wrong1234');
    await waitFor(() => {
      expect(screen.getByTestId('deletion-error')).toBeTruthy();
    });
    expect(screen.queryByTestId('deletion-scheduled', { includeHiddenElements: true })).toBeNull();
  });

  it('can leave the flow from the first step', async () => {
    await setup();
    await fireEvent.press(screen.getByTestId('deletion-back'));
    expect(mockReplace).toHaveBeenCalledWith('/settings');
  });
});
