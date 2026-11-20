import { getLanguage, setLanguage, translate } from '@/i18n';
import { RULES_V1 } from '../engine/rules.v1';
import { WORKFLOW_STATUSES } from '../state-machine/workflow';

describe('assistance i18n keys', () => {
  afterEach(async () => {
    await setLanguage('ar');
  });

  it('resolves every workflow status label in Arabic', async () => {
    await setLanguage('ar');
    expect(getLanguage()).toBe('ar');
    for (const status of WORKFLOW_STATUSES) {
      const key = `assistance:workflow.status.${status}`;
      expect(translate(key)).not.toBe(key);
    }
  });

  it('resolves every band label and recommendation in English', async () => {
    await setLanguage('en');
    for (const band of RULES_V1.bands) {
      expect(translate(band.labelKey)).not.toBe(band.labelKey);
      expect(translate(band.recommendationKey)).not.toBe(band.recommendationKey);
    }
  });

  it('resolves gate reasons and engine explanations', async () => {
    await setLanguage('ar');
    expect(translate('assistance:gates.notWealthy.fail')).not.toBe(
      'assistance:gates.notWealthy.fail',
    );
    expect(translate('assistance:engine.explain.needSeverity')).not.toBe(
      'assistance:engine.explain.needSeverity',
    );
    expect(translate('assistance:engine.excluded')).not.toBe('assistance:engine.excluded');
  });

  it('resolves document kinds and privacy notes', async () => {
    await setLanguage('ar');
    expect(translate('assistance:documents.kind.identity')).not.toBe(
      'assistance:documents.kind.identity',
    );
    expect(translate('assistance:documents.private')).not.toBe('assistance:documents.private');
  });
});
