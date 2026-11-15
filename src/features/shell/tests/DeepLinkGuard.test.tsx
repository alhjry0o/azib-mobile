import { render } from '@testing-library/react-native';
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

  it('replaces unknown azib links with the not-found route', () => {
    mockUseURL.mockReturnValue('azib://secret-admin-panel');
    render(<DeepLinkGuard />);
    expect(mockReplace).toHaveBeenCalledWith('/+not-found');
  });

  it('leaves allowed links to the router', () => {
    mockUseURL.mockReturnValue('azib://services');
    render(<DeepLinkGuard />);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('leaves guarded links to their layout guards', () => {
    mockUseURL.mockReturnValue('azib://staff');
    render(<DeepLinkGuard />);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does nothing without a URL', () => {
    mockUseURL.mockReturnValue(null);
    render(<DeepLinkGuard />);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
