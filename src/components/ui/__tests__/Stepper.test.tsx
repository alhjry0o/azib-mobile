import { render } from '@testing-library/react-native';

import { Providers } from './test-utils';
import { Stepper } from '../Stepper';

describe('Stepper', () => {
  const STEPS = ['Account', 'Profile', 'Verify', 'Done'];

  it('renders all step labels', async () => {
    const { getByText } = await render(<Stepper steps={STEPS} currentStep={1} />, {
      wrapper: Providers,
    });
    for (const s of STEPS) {
      expect(getByText(s)).toBeTruthy();
    }
  });

  it('exposes progressbar role and value', async () => {
    const { getByRole } = await render(<Stepper steps={STEPS} currentStep={1} />, {
      wrapper: Providers,
    });
    const el = getByRole('progressbar');
    expect(el.props.accessibilityValue).toEqual({ min: 0, max: 4, now: 2 });
  });

  it('renders completed check icon for past steps (indirect via labels)', async () => {
    const { getByText, queryByText } = await render(
      <Stepper steps={STEPS} currentStep={2} />,
      { wrapper: Providers },
    );
    // Steps 1 and 2 are completed — number "1" and "2" should not be visible inside circles,
    // but labels still contain "Account" and "Profile" (which are strings, not numbers).
    expect(getByText('Account')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
    // The current step is index 2 (0-based) => circle shows "3"
    expect(getByText('3')).toBeTruthy();
    // Steps beyond current: index 3 => circle shows "4"
    expect(getByText('4')).toBeTruthy();
    // No step should display the raw "1" or "2" since they are completed (check icon)
    expect(queryByText('1')).toBeNull();
    expect(queryByText('2')).toBeNull();
  });

  it('renders without crash at currentStep=0', async () => {
    const { getByTestId } = await render(
      <Stepper steps={STEPS} currentStep={0} testID="st" />,
      { wrapper: Providers },
    );
    expect(getByTestId('st')).toBeTruthy();
  });

  it('renders without crash at final step', async () => {
    const { getByTestId } = await render(
      <Stepper steps={STEPS} currentStep={3} testID="st" />,
      { wrapper: Providers },
    );
    expect(getByTestId('st')).toBeTruthy();
  });
});
