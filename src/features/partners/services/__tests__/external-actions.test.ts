import { Share } from 'react-native';
import { openExternalUrl, shareText } from '../external-actions';

jest.mock('expo-linking', () => ({
  openURL: jest.fn(async () => undefined),
}));

describe('external actions boundary', () => {
  it('opens only allowlisted URLs', async () => {
    const okTel = await openExternalUrl('tel:+967771234567');
    expect(okTel.ok).toBe(true);
    const okWa = await openExternalUrl('https://wa.me/967771234567');
    expect(okWa.ok).toBe(true);
  });

  it('refuses look-alike hosts and dangerous schemes before opening', async () => {
    for (const url of [
      'javascript:alert(1)',
      'https://wa.me.evil.example/967771234567',
      'http://evil.example',
      '',
    ]) {
      const result = await openExternalUrl(url);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.meta.code).toBe('EXTERNAL_URL_BLOCKED');
    }
  });

  it('shares text and reports dismissal honestly', async () => {
    const spy = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction, activityType: undefined });
    const shared = await shareText('Demo offer');
    expect(shared.ok).toBe(true);
    if (shared.ok) expect(shared.value).toBe(true);

    spy.mockResolvedValue({ action: Share.dismissedAction, activityType: undefined });
    const dismissed = await shareText('Demo offer');
    expect(dismissed.ok).toBe(true);
    if (dismissed.ok) expect(dismissed.value).toBe(false);
    spy.mockRestore();
  });

  it('rejects empty share text', async () => {
    const result = await shareText('   ');
    expect(result.ok).toBe(false);
  });
});
