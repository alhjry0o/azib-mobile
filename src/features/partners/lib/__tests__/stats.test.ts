import { SMALL_NUMBER_THRESHOLD } from '@/features/home/stats-privacy';
import { computeOfferStats, totalViews } from '../stats';

describe('aggregate offer stats', () => {
  it('suppresses small view and save counts', () => {
    const stats = computeOfferStats({ offerId: 'o1', views: 3, saves: 1 });
    expect(stats.views.kind).toBe('suppressed');
    expect(stats.saves.kind).toBe('suppressed');
    expect(stats.threshold).toBe(SMALL_NUMBER_THRESHOLD);
  });

  it('reveals counts at or above the threshold', () => {
    const stats = computeOfferStats({ offerId: 'o1', views: 12, saves: 10 });
    expect(stats.views.kind).toBe('value');
    expect(stats.saves.kind).toBe('value');
    if (stats.views.kind === 'value') expect(stats.views.value).toBe(12);
  });

  it('honours a custom threshold', () => {
    const stats = computeOfferStats({ offerId: 'o1', views: 2, saves: 0, threshold: 2 });
    expect(stats.views.kind).toBe('value');
  });

  it('never exposes a viewer identity in the result shape', () => {
    const stats = computeOfferStats({ offerId: 'o1', views: 50, saves: 20 });
    expect(Object.keys(stats).sort()).toEqual(['offerId', 'saves', 'threshold', 'views']);
  });

  it('sums aggregate counters safely', () => {
    expect(totalViews({ a: 3, b: 4 })).toBe(7);
    expect(totalViews({ a: Number.NaN, b: 2 })).toBe(2);
    expect(totalViews({})).toBe(0);
  });
});
