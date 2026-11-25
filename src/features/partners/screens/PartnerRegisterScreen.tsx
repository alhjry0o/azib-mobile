import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Banner, Button, Checkbox, Select, Text, TextInput, Textarea } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { authErrorKey } from '@/features/auth/errors';
import { childrenOf } from '@/features/profile/locations';
import { useTheme } from '@/theme';
import { MediaUploadField } from '../components/MediaUploadField';
import { PartnerScaffold } from '../components/PartnerScaffold';
import { usePartnerRegistration } from '../hooks/use-partner-registration';
import { PARTNER_CATEGORIES } from '../lib/categories';

export function PartnerRegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const registration = usePartnerRegistration();

  const governorates = useMemo(
    () => childrenOf(null).map((g) => ({ value: g.id, label: t(g.nameKey) })),
    [t],
  );
  const districts = useMemo(
    () =>
      registration.form.governorateId
        ? childrenOf(registration.form.governorateId).map((d) => ({
            value: d.id,
            label: t(d.nameKey),
          }))
        : [],
    [registration.form.governorateId, t],
  );

  const errorText = (field: string): string | undefined => {
    const key = registration.fieldErrors[field];
    return key ? t(key) : undefined;
  };

  const submit = async (): Promise<void> => {
    const result = await registration.submit();
    if (result.ok) router.replace(href(ROUTES.partners.dashboard));
  };

  return (
    <PartnerScaffold
      testID="partner-register-screen"
      title={t('marketplace:register.title')}
      subtitle={t('marketplace:register.subtitle')}
    >
      <Banner
        variant="info"
        message={t('marketplace:register.reviewNote')}
        testID="register-review-note"
      />
      <TextInput
        testID="register-name"
        label={t('marketplace:register.fields.name')}
        required
        value={registration.form.displayName}
        onChangeText={(value) => registration.patch({ displayName: value })}
        errorText={errorText('displayName')}
      />
      <Select
        testID="register-category"
        label={t('marketplace:register.fields.category')}
        required
        value={registration.form.category}
        options={PARTNER_CATEGORIES.map((c) => ({
          value: c,
          label: t(`marketplace:categories.${c}`),
        }))}
        onChange={(value) => registration.patch({ category: value })}
        errorText={errorText('category')}
      />
      <Textarea
        testID="register-description"
        label={t('marketplace:register.fields.description')}
        required
        value={registration.form.description}
        onChangeText={(value) => registration.patch({ description: value })}
        minHeight={90}
        errorText={errorText('description')}
      />
      <Select
        testID="register-governorate"
        label={t('marketplace:register.fields.governorate')}
        required
        value={registration.form.governorateId || null}
        options={governorates}
        onChange={(value) =>
          registration.patch({ governorateId: value, districtId: null })
        }
        errorText={errorText('governorateId')}
      />
      <Select
        testID="register-district"
        label={t('marketplace:register.fields.district')}
        value={registration.form.districtId}
        options={districts}
        disabled={districts.length === 0}
        onChange={(value) => registration.patch({ districtId: value })}
      />
      <TextInput
        testID="register-phone"
        label={t('marketplace:register.fields.phone')}
        required
        keyboardType="phone-pad"
        value={registration.form.contactPhone}
        onChangeText={(value) => registration.patch({ contactPhone: value })}
        errorText={errorText('contactPhone')}
      />
      <TextInput
        testID="register-whatsapp"
        label={t('marketplace:register.fields.whatsapp')}
        keyboardType="phone-pad"
        helpText={t('marketplace:register.help.whatsapp')}
        value={registration.form.whatsapp ?? ''}
        onChangeText={(value) =>
          registration.patch({ whatsapp: value.length > 0 ? value : null })
        }
      />

      <MediaUploadField
        testID="register-images"
        label={t('marketplace:register.images')}
        fileIds={registration.form.imageFileIds}
        uploading={registration.uploading}
        onPick={(source) => {
          void registration.uploadMedia('image', source);
        }}
        onRemove={(fileId) => registration.removeMedia('image', fileId)}
      />
      <MediaUploadField
        testID="register-documents"
        label={t('marketplace:register.documents')}
        helpText={t('marketplace:register.documentsHelp')}
        fileIds={registration.form.documentFileIds}
        uploading={registration.uploading}
        allowPdf
        onPick={(source) => {
          void registration.uploadMedia('document', source);
        }}
        onRemove={(fileId) => registration.removeMedia('document', fileId)}
      />
      {errorText('documentFileIds') ? (
        <Text variant="caption" color="accent" testID="register-documents-error">
          {errorText('documentFileIds')}
        </Text>
      ) : null}

      <Checkbox
        testID="register-terms"
        checked={registration.form.termsAccepted}
        onCheckedChange={(value) => registration.patch({ termsAccepted: value })}
        label={t('marketplace:register.terms')}
        error={!!registration.fieldErrors.termsAccepted}
      />
      {errorText('termsAccepted') ? (
        <Text variant="caption" color="accent" testID="register-terms-error">
          {errorText('termsAccepted')}
        </Text>
      ) : null}

      {registration.error ? (
        <Banner
          variant="error"
          message={t(authErrorKey(registration.error))}
          testID="register-error"
        />
      ) : null}

      <Button
        fullWidth
        loading={registration.busy}
        label={t('marketplace:register.submit')}
        onPress={() => {
          void submit();
        }}
        testID="register-submit"
      />
      <Text variant="caption" color="secondary" style={{ marginBottom: theme.spacing[4] }}>
        {t('marketplace:register.privateNote')}
      </Text>
    </PartnerScaffold>
  );
}
