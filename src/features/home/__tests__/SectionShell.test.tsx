import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Providers } from '@/components/ui/__tests__/test-utils';
import { translate } from '@/i18n';
import { SectionShell } from '../components/SectionShell';

function renderShell(status: 'loading' | 'empty' | 'error' | 'not-connected' | 'ready', onRetry = jest.fn()) {
  return render(
    <Providers>
      <SectionShell
        id="demo"
        title="Section"
        status={status}
        emptyTitle="Nothing here"
        emptyDescription="Add data to see it."
        actionLabel="See all"
        onAction={jest.fn()}
        onRetry={onRetry}
      >
        <Text testID="section-content">content</Text>
      </SectionShell>
    </Providers>,
  );
}

describe('SectionShell', () => {
  it('renders skeletons while loading and hides content', async () => {
    await renderShell('loading');
    expect(screen.getByTestId('section-demo-loading')).toBeTruthy();
    expect(screen.queryByTestId('section-content', { includeHiddenElements: true })).toBeNull();
  });

  it('renders an honest empty state', async () => {
    await renderShell('empty');
    expect(screen.getByTestId('section-demo-empty')).toBeTruthy();
    expect(screen.getByText('Nothing here')).toBeTruthy();
  });

  it('renders an error state with a working retry', async () => {
    const onRetry = jest.fn();
    await renderShell('error', onRetry);
    expect(screen.getByTestId('section-demo-error')).toBeTruthy();
    const buttons = screen.getAllByRole('button');
    await fireEvent.press(buttons[0]!);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders a not-connected state in backend mode', async () => {
    await renderShell('not-connected');
    expect(screen.getByTestId('section-demo-not-connected')).toBeTruthy();
    expect(screen.getByText(translate('home:states.notConnected'))).toBeTruthy();
  });

  it('renders content and the see-all action when ready', async () => {
    await renderShell('ready');
    expect(screen.getByTestId('section-content')).toBeTruthy();
    expect(screen.getByTestId('section-demo-header-action')).toBeTruthy();
  });
});
