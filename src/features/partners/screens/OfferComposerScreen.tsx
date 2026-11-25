import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Banner,
  Button,
  DatePicker,
  Select,
  Text,
  TextInput,
  Textarea,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { authErrorKey } from '@/features/auth/errors';
import { childrenOf } from '@/features/profile/locations';
import { useTheme } from '@/theme';
import { MediaUploadField } from '../components/MediaUploadField';
import { PartnerScaffold } from '../components/PartnerScaffold';
import { useMyPartner } from '../hooks/use-my-partner';
import { useOfferComposer } from '../hooks/use-offer-composer';
import { AUDIENCE_OPTIONS } from '../config/limits';
import { PARTNER_CATEGORIES } from '../lib/categories';
import type { DiscountType, OfferAudience } from '@/repositories/contracts/offer';

const DISCOUNT_TYPES: readonly DiscountType[] = ['percent', 'fixed', 'gift', 'service'];

export function OfferComposerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ offerId?: string }>();
  const offerId = params.offerId ?? null;
  const mine = useMyPartner();
  const composer = useOfferComposer();

  const partner = mine.data?.partner ?? null;
  const governorates = useMemo(
    () => childrenOf(null).map((g) => ({ value: g.id, label: t(g.nameKey) })),
    [t],
  );

  const errorText = (field: string): string | undefined => {
    const key = composer.fieldErrors[field];
    return key ? t(key) : undefined;
  };

  const save = async (): Promise<void> => {
    if (!partner) return;
    const result = await composer.saveDraft(partner.id, offerId);
    if (result.ok) router.replace(href(ROUTES.partners.dashboard));
  };

  return (
    <PartnerScaffold
      testID="offer-composer-screen"
      title={offerId ? t('marketplace:composer.editTitle') : t('marketplace:composer.title')}
      subtitle={t('marketplace:composer.subtitle')}
      backTo={ROUTES.partners.dashboard}
      notConnectedRetry={mine.refetch}
    >
      {!mine.isLoading && !partner ? (
        <Banner
          variant="warning"
          message={t('marketplace:composer.noPartner')}
          testID="composer-no-partner"
        />
      ) : null}

      <Banner
        variant="info"
        message={t('marketplace:composer.reviewNote')}
        testID="composer-review-note"
      />

      <TextInput
        testID="composer-title"
        label={t('marketplace:composer.fields.title')}
        required
        value={composer.form.title}
        onChangeText={(value) => composer.patch({ title: value })}
        errorText={errorText('title')}
      />
      <Select
        testID="composer-category"
        label={t('marketplace:composer.fields.category')}
        required
        value={composer.form.category}
        options={PARTNER_CATEGORIES.map((c) => ({
          value: c,
          label: t(`marketplace:categories.${c}`),
        }))}
        onChange={(value) => composer.patch({ category: value })}
      />
      <Select
        testID="composer-governorate"
        label={t('marketplace:composer.fields.governorate')}
        required
        value={composer.form.governorateId || null}
        options={governorates}
        onChange={(value) => composer.patch({ governorateId: value })}
        errorText={errorText('governorateId')}
      />
      <Select<DiscountType>
        testID="composer-discount-type"
        label={t('marketplace:composer.fields.discountType')}
        required
        value={composer.form.discountType}
        options={DISCOUNT_TYPES.map((d) => ({
          value: d,
          label: t(`marketplace:discount.types.${d}`),
        }))}
        onChange={(value) => composer.patch({ discountType: value })}
      />
      <TextInput
        testID="composer-discount-value"
        label={t('marketplace:composer.fields.discountValue')}
        required
        keyboardType="number-pad"
        value={String(composer.form.discountValue)}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '').slice(0, 9);
          composer.patch({ discountValue: digits.length === 0 ? 0 : Number.parseInt(digits, 10) });
        }}
        errorText={errorText('discountValue')}
      />
      <Select<OfferAudience>
        testID="composer-audience"
        label={t('marketplace:composer.fields.audience')}
        required
        value={composer.form.audience}
        options={AUDIENCE_OPTIONS.map((option) => ({
          value: option.value,
          label: t(option.labelKey),
          disabled: !option.enabled,
        }))}
        onChange={(value) => composer.patch({ audience: value })}
        helpText={t('marketplace:composer.audienceNote')}
      />
      <DatePicker
        testID="composer-valid-from"
        label={t('marketplace:composer.fields.validFrom')}
        required
        value={composer.form.validFrom ? new Date(composer.form.validFrom) : null}
        onChange={(date) => composer.patch({ validFrom: date ? date.toISOString() : '' })}
        errorText={errorText('validFrom')}
      />
      <DatePicker
        testID="composer-valid-until"
        label={t('marketplace:composer.fields.validUntil')}
        required
        value={composer.form.validUntil ? new Date(composer.form.validUntil) : null}
        onChange={(date) => composer.patch({ validUntil: date ? date.toISOString() : '' })}
        errorText={errorText('validUntil')}
      />
      <TextInput
        testID="composer-products"
        label={t('marketplace:composer.fields.products')}
        helpText={t('marketplace:composer.productsHelp')}
        value={composer.form.products.join(', ')}
        onChangeText={(text) =>
          composer.patch({
            products: text
              .split(',')
              .map((p) => p.trim())
              .filter((p) => p.length > 0),
          })
        }
      />
      <Textarea
        testID="composer-terms"
        label={t('marketplace:composer.fields.terms')}
        value={composer.form.terms ?? ''}
        onChangeText={(value) => composer.patch({ terms: value.length > 0 ? value : null })}
        minHeight={90}
      />

      <MediaUploadField
        testID="composer-images"
        label={t('marketplace:composer.images')}
        fileIds={composer.form.imageFileIds}
        uploading={composer.uploading}
        onPick={() => {
          void composer.uploadImage();
        }}
        onRemove={composer.removeImage}
      />

      {composer.error ? (
        <Banner
          variant="error"
          message={t(authErrorKey(composer.error))}
          testID="composer-error"
        />
      ) : null}

      <Button
        fullWidth
        disabled={!partner}
        loading={composer.busy}
        label={t('marketplace:composer.save')}
        onPress={() => {
          void save();
        }}
        testID="composer-save"
      />
      <Text variant="caption" color="secondary" style={{ marginBottom: theme.spacing[4] }}>
        {t('marketplace:composer.noPaymentNote')}
      </Text>
    </PartnerScaffold>
  );
}
