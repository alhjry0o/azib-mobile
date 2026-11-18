import { fireEvent, render, screen } from '@testing-library/react-native';
import { Providers } from '@/components/ui/__tests__/test-utils';
import { translate } from '@/i18n';
import { LegalDocScreen } from '../LegalDocScreen';

const mockReplace = jest.fn();
let mockDoc: string | undefined = 'terms';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({ doc: mockDoc }),
}));

describe('LegalDocScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockDoc = 'terms';
  });

  it('renders the document with its version and the legal review banner', async () => {
    await render(
      <Providers>
        <LegalDocScreen />
      </Providers>,
    );
    expect(screen.getByTestId('legal-review-banner')).toBeTruthy();
    expect(screen.getByTestId('legal-version')).toBeTruthy();
    expect(screen.getByText(translate('legal:docs.terms.title'))).toBeTruthy();
    expect(screen.getByTestId('legal-section-scope')).toBeTruthy();
    expect(screen.getByTestId('legal-section-liability')).toBeTruthy();
  });

  it('renders every registered document', async () => {
    for (const slug of ['privacy', 'eligibility', 'weddings-withdrawal', 'souk']) {
      mockDoc = slug
      const { unmount } = render(
        <Providers>
          <LegalDocScreen />
        </Providers>,
      )
      await waitFor(() => expect(screen.getByTestId('legal-review-banner')).toBeTruthy())
      unmount()
    }
  })

  it('shows an honest missing state for an unknown slug', async () => {
    mockDoc = 'unknown-doc';
    await render(
      <Providers>
        <LegalDocScreen />
      </Providers>,
    );
    expect(screen.getByTestId('legal-not-found')).toBeTruthy();
    const buttons = screen.getAllByRole('button');
    await fireEvent.press(buttons[0]!);
    expect(mockReplace).toHaveBeenCalledWith('/settings');
  });

  it('returns to settings from a valid document', async () => {
    await render(
      <Providers>
        <LegalDocScreen />
      </Providers>,
    );
    await fireEvent.press(screen.getByTestId('legal-back'));
    expect(mockReplace).toHaveBeenCalledWith('/settings');
  });
});
