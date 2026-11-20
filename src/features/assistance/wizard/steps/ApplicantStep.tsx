import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, Select, Text, TextInput } from '@/components/ui';
import { useAssistanceDraftStore } from '@/stores';
import { childrenOf } from '@/features/profile/locations';
import { fingerprint } from '../../services/hash';
import type { FieldErrors } from '../../schemas/wizard';
import { NumericField } from '../../components/NumericField';
import { WizardStepShell } from '../../components/WizardStepShell';

export interface ApplicantStepProps {
  readonly errors: FieldErrors;
}

export function ApplicantStep({ errors }: ApplicantStepProps) {
  const { t } = useTranslation();
  const draft = useAssistanceDraftStore();
  const [identity, setIdentity] = useState('');
  const [phone, setPhone] = useState('');

  const governorates = childrenOf(null).map((g) => ({ value: g.id, label: t(g.nameKey) }));
  const districts = draft.applicant.governorateId
    ? childrenOf(draft.applicant.governorateId).map((d) => ({ value: d.id, label: t(d.nameKey) }))
    : [];

  const saveFingerprint = async (raw: string, field: 'identityHash' | 'phoneHash'): Promise<void> => {
    if (raw.trim().length < 4) return;
    const hashed = await fingerprint(raw);
    if (hashed.ok) draft.patchApplicant({ [field]: hashed.value });
  };

  const hasFingerprints =
    draft.applicant.identityHash !== null && draft.applicant.phoneHash !== null;

  return (
    <WizardStepShell
      testID="step-applicant"
      title={t('assistance:wizard.steps.applicant')}
      whyKey="assistance:wizard.why.applicant"
    >
      <Select
        testID="applicant-governorate"
        label={t('assistance:wizard.fields.governorate')}
        required
        value={draft.applicant.governorateId || null}
        options={governorates}
        onChange={(value) => draft.patchApplicant({ governorateId: value, districtId: null })}
        errorText={errors.governorateId ? t(errors.governorateId) : undefined}
      />
      <Select
        testID="applicant-district"
        label={t('assistance:wizard.fields.district')}
        value={draft.applicant.districtId}
        options={districts}
        disabled={districts.length === 0}
        onChange={(value) => draft.patchApplicant({ districtId: value })}
      />
      <NumericField
        testID="applicant-birth-year"
        label={t('assistance:wizard.fields.birthYear')}
        required
        value={draft.applicant.birthYear}
        onChange={(value) => draft.patchApplicant({ birthYear: value })}
        errorText={errors.birthYear ? t(errors.birthYear) : undefined}
      />
      <NumericField
        testID="applicant-household"
        label={t('assistance:wizard.fields.household')}
        required
        value={draft.applicant.householdSize}
        onChange={(value) => draft.patchApplicant({ householdSize: value })}
        errorText={errors.householdSize ? t(errors.householdSize) : undefined}
      />

      {hasFingerprints ? (
        <View style={styles.saved} testID="applicant-fingerprints-saved">
          <Badge variant="verified" label={t('assistance:wizard.fingerprints.saved')} />
          <Text variant="caption" color="secondary">
            {t('assistance:wizard.fingerprints.note')}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            label={t('assistance:wizard.fingerprints.edit')}
            onPress={() => {
              draft.clearFingerprints();
              setIdentity('');
              setPhone('');
            }}
            testID="applicant-fingerprints-edit"
          />
        </View>
      ) : (
        <View style={styles.saved}>
          <TextInput
            testID="applicant-identity"
            label={t('assistance:wizard.fields.identity')}
            required
            keyboardType="number-pad"
            value={identity}
            onChangeText={setIdentity}
            onBlur={() => {
              void saveFingerprint(identity, 'identityHash');
            }}
            errorText={errors.identityHash ? t(errors.identityHash) : undefined}
          />
          <TextInput
            testID="applicant-phone"
            label={t('assistance:wizard.fields.phone')}
            required
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            onBlur={() => {
              void saveFingerprint(phone, 'phoneHash');
            }}
            errorText={errors.phoneHash ? t(errors.phoneHash) : undefined}
          />
          <Text variant="caption" color="secondary">
            {t('assistance:wizard.fingerprints.note')}
          </Text>
        </View>
      )}
    </WizardStepShell>
  );
}

const styles = StyleSheet.create({
  saved: { gap: 8, width: '100%' },
});
