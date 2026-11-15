import { NAMESPACES } from '../config';
import { getLanguage, setLanguage, translate } from '../index';

describe('onboarding namespace', () => {
  afterEach(async () => {
    await setLanguage('ar');
  });

  it('is registered in NAMESPACES', () => {
    expect(NAMESPACES).toContain('onboarding');
  });

  it('resolves keys in Arabic', async () => {
    await setLanguage('ar');
    expect(getLanguage()).toBe('ar');
    expect(translate('onboarding:steps.brand')).not.toBe('onboarding:steps.brand');
    expect(translate('onboarding:privacy.noDating.title')).not.toBe(
      'onboarding:privacy.noDating.title',
    );
    expect(translate('onboarding:splash.tagline')).not.toBe('onboarding:splash.tagline');
  });

  it('resolves keys in English', async () => {
    await setLanguage('en');
    expect(getLanguage()).toBe('en');
    expect(translate('onboarding:finish')).not.toBe('onboarding:finish');
    expect(translate('onboarding:language.directionNote')).not.toBe(
      'onboarding:language.directionNote',
    );
  });
});
