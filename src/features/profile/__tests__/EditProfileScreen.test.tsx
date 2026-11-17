import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ShellProviders, createTestQueryClient, makeDemoSession, resetShellStores } from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { translate } from '@/i18n';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAuthStore } from '@/stores';
import { EditProfileScreen } from '../screens/EditProfileScreen';

const mockReplace = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

describe('EditProfileScreen', () => {
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
    client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
    await render(
      <ShellProviders client={client}>
        <Probe />
        <EditProfileScreen />
      </ShellProviders>,
    );
    await act(async () => {
      await container!.repositories.profiles.create({
        userId: 'demo-user-test',
        displayName: 'Demo User',
        gender: 'unspecified',
        maritalStatus: 'single',
      });
    });
    await act(async () => {
      await client.invalidateQueries();
    });
    await waitFor(() => {
      expect(screen.getByTestId('edit-display-name')).toBeTruthy();
    });
    return client;
  }

  it('loads existing values and saves a new display name', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('edit-display-name'), 'Updated Name');
    await fireEvent(screen.getByTestId('edit-governorate'), 'onChange', 'sanaa');
    await fireEvent(screen.getByTestId('edit-district'), 'onChange', 'maeen');
  
    await fireEvent.press(screen.getByTestId('edit-profile-save'));
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/profile');
    });
  });

  it('blocks saving without a location chain', async () => {
    await setup();
    await fireEvent.changeText(screen.getByTestId('edit-display-name'), 'Valid Name');
    await fireEvent.press(screen.getByTestId('edit-profile-save'));
    await waitFor(() => {
      expect(screen.getByText(translate('profile:validation.governorateRequired'))).toBeTruthy();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('uploads an avatar through the storage provider', async () => {
    await setup();
    await fireEvent.press(screen.getByTestId('avatar-change'));
    await waitFor(() => {
      const changeBtn = screen.getByTestId('avatar-change');
      expect(changeBtn.props.accessibilityState.busy).toBe(false);
    });
    await waitFor(() => {
      expect(screen.getByTestId('avatar-remove')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('avatar-remove'));
    await waitFor(() => {
      expect(screen.queryByTestId('avatar-remove')).toBeNull();
    });
  });

  it('goes back to the profile screen', async () => {
    await setup();
    await fireEvent.press(screen.getByTestId('edit-profile-back'));
    expect(mockReplace).toHaveBeenCalledWith('/profile');
  });
});
