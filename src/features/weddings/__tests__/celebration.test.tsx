import { render, screen } from '@testing-library/react-native';
import { Providers } from '@/components/ui/__tests__/test-utils';
import { CostSplitBars } from '../components/CostSplitBars';
import { GoldConfetti } from '../components/GoldConfetti';
import { RingCountdown } from '../components/RingCountdown';

describe('celebration and report components', () => {
  it('renders one bar per member', async () => {
    await render(
      <Providers>
        <CostSplitBars
          shares={[
            { memberId: 'a', individual: 0, shared: 30000, total: 30000 },
            { memberId: 'b', individual: 10000, shared: 30000, total: 40000 },
          ]}
          labels={{ a: 'A', b: 'B' }}
          testID="bars"
        />
      </Providers>,
    );
    expect(screen.getByTestId('cost-bar-a')).toBeTruthy();
    expect(screen.getByTestId('cost-bar-b')).toBeTruthy();
  });

  it('renders confetti and the countdown rings', async () => {
    await render(
      <Providers>
        <GoldConfetti testID="confetti" />
        <RingCountdown days={12} hours={4} isPast={false} testID="rings" />
      </Providers>,
    );
    expect(screen.getByTestId('confetti')).toBeTruthy();
    expect(screen.getByTestId('rings')).toBeTruthy();
    expect(screen.getByTestId('countdown-days')).toBeTruthy();
  });

  it('shows the past state honestly', async () => {
    await render(
      <Providers>
        <RingCountdown days={0} hours={0} isPast testID="rings-past" />
      </Providers>,
    );
    expect(screen.getByTestId('countdown-days')).toBeTruthy();
  });
});
