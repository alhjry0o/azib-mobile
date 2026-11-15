import { render, waitFor } from '@testing-library/react-native';
import { DeepLinkGuard } from '../DeepLinkGuard';

const mockReplace = jest.fn();
const mockUseURL = jest.fn<string | null, []>();

jest.mock('expo-linking', () => ({
  useURL: () => mockUseURL(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
}));

describe('DeepLinkGuard', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockUseURL.mockReset();
  });

  it('replaces unknown azib links with the not-found route', async () => {
    mockUseURL.mockReturnValue('azib://secret-admin-panel');
    await render(<DeepLinkGuard />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/+not-found');
    });
  });

  it('leaves allowed links to the router', async () => {
    mockUseURL.mockReturnValue('azib://services');
    await render(<DeepLinkGuard />);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('leaves guarded links to their layout guards', async () => {
    mockUseURL.mockReturnValue('azib://staff');
    await render(<DeepLinkGuard />);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does nothing without a URL', async () => {
    mockUseURL.mockReturnValue(null);
    await render(<DeepLinkGuard />);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
