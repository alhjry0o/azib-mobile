import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  Banner,
  Button,
  Card,
  Checkbox,
  Icon,
  Select,
  Text,
  TextInput,
  Textarea,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { childrenOf } from '@/features/profile/locations';
import { useTheme } from '@/theme';
import type { SoukCondition, SoukDeliveryMethod } from '@/repositories/contracts/souk';
import { SoukScaffold } from '../components/SoukScaffold';
import { useSoukComposer } from '../hooks/use-souk-composer';
import { SOUK_CATEGORIES } from '../state/filters';
import { soukErrorKey } from '../state/error-keys';

const CONDITIONS: readonly SoukCondition[] = ['new', 'good', 'acceptable'];
const DELIVERY: readonly SoukDeliveryMethod[] = ['self_pickup', 'donor_delivers', 'volunteer_help'];

export function SoukItemComposerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const composer = useSoukComposer();

  const governorates = useMemo(
    () => childrenOf(null).map((g) => ({ value: g.id, label: t(g.nameKey) })),
    [t],
  );
  const districts = useMemo(
    () =>
      composer.form.governorateId
        ? childrenOf(composer.form.governorateId).map((d) => ({
            value: d.id,
            label: t(d.nameKey),
          }))
        : [],
    [composer.form.governorateId, t],
  );

  const errorText = (field: string): string | undefined => {
    const key = composer.fieldErrors[field];
    return key ? t(key) : undefined;
  };

  const submit = async (): Promise<void> => {
    const result = await composer.submit();
    if (result.ok) router.replace(href(ROUTES.souk.mine));
  };

  return (
    <SoukScaffold
      testID="souk-composer-screen"
      title={t('marketplace:souk.composer.title')}
      subtitle={t('marketplace:souk.composer.subtitle')}
    >
      <Banner
        variant="warning"
        message={t('marketplace:souk.composer.noPriceNote')}
        testID="souk-composer-no-price"
      />

      <TextInput
        testID="souk-composer-title"
        label={t('marketplace:souk.composer.fields.title')}
        required
        value={composer.form.title}
        onChangeText={(value) => composer.patch({ title: value })}
        errorText={errorText('title')}
      />
      <Select
        testID="souk-composer-category"
        label={t('marketplace:souk.composer.fields.category')}
        required
        value={composer.form.category}
        options={SOUK_CATEGORIES.map((c) => ({
          value: c,
          label: t(`marketplace:souk.categories.${c}`),
        }))}
        onChange={(value) => composer.patch({ category: value })}
      />
      <Select<SoukCondition>
        testID="souk-composer-condition"
        label={t('marketplace:souk.composer.fields.condition')}
        required
        value={composer.form.condition}
        options={CONDITIONS.map((c) => ({
          value: c,
          label: t(`marketplace:souk.condition.${c}`),
        }))}
        onChange={(value) => composer.patch({ condition: value })}
      />
      <Textarea
        testID="souk-composer-description"
        label={t('marketplace:souk.composer.fields.description')}
        required
        helpText={t('marketplace:souk.composer.descriptionHelp')}
        value={composer.form.description}
        onChangeText={(value) => composer.patch({ description: value })}
        minHeight={100}
        errorText={errorText('description')}
      />
      <Select
        testID="souk-composer-governorate"
        label={t('marketplace:souk.composer.fields.governorate')}
        required
        value={composer.form.governorateId || null}
        options={governorates}
        onChange={(value) => composer.patch({ governorateId: value, districtId: null })}
        errorText={errorText('governorateId')}
      />
      <Select
        testID="souk-composer-district"
        label={t('marketplace:souk.composer.fields.district')}
        value={composer.form.districtId}
        options={districts}
        disabled={districts.length === 0}
        onChange={(value) => composer.patch({ districtId: value })}
      />
      <Select<SoukDeliveryMethod>
        testID="souk-composer-delivery"
        label={t('marketplace:souk.composer.fields.delivery')}
        required
        value={composer.form.deliveryMethod}
        options={DELIVERY.map((d) => ({
          value: d,
          label: t(`marketplace:souk.delivery.${d}`),
        }))}
        onChange={(value) => composer.patch({ deliveryMethod: value })}
      />

      <Card style={{ gap: theme.spacing[2] }} testID="souk-composer-images">
        <Text variant="bodyStrong">{t('marketplace:souk.composer.images')}</Text>
        <Text variant="caption" color="secondary">
          {t('marketplace:souk.composer.imagesHelp', { max: composer.maxImages })}
        </Text>
        <Button
          variant="secondary"
          size="sm"
          leftIcon="plus"
          disabled={composer.uploading || composer.images.length >= composer.maxImages}
          label={t('marketplace:souk.composer.addImage')}
          onPress={() => {
            void composer.addImage();
          }}
          testID="souk-composer-add-image"
        />
        {composer.uploading ? (
          <Text variant="caption" color="secondary" testID="souk-composer-uploading">
            {t('marketplace:souk.composer.uploading')}
          </Text>
        ) : null}
        {composer.images.map((image, index) => (
          <View key={image.fileId} style={{ gap: theme.spacing[1] }}>
            <Text variant="caption" color="secondary">
              {t('marketplace:souk.composer.imageAttached', { index: index + 1 })}
            </Text>
            <Button
              variant="icon"
              size="sm"
              leftIcon="x"
              accessibilityLabel={t('marketplace:souk.composer.removeImage')}
              onPress={() => composer.removeImage(image.fileId)}
              testID={`souk-composer-remove-image-${index}`}
            />
          </View>
        ))}
        <Text variant="caption" color="tertiary">
          {t('marketplace:souk.composer.exifNote')}
        </Text>
      </Card>

      <TextInput
        testID="souk-composer-estimate"
        label={t('marketplace:souk.estimated.label')}
        keyboardType="number-pad"
        helpText={t('marketplace:souk.estimated.help')}
        value={composer.form.estimatedValue === null ? '' : String(composer.form.estimatedValue)}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '').slice(0, 9);
          composer.patch({
            estimatedValue: digits.length === 0 ? null : Number.parseInt(digits, 10),
          });
        }}
      />
      <Text variant="caption" color="secondary">
        {t('marketplace:souk.estimated.unverified')}
      </Text>

      <Checkbox
        testID="souk-composer-no-resale"
        checked={composer.form.noResaleConsent}
        onCheckedChange={(value) => composer.patch({ noResaleConsent: value })}
        label={t('marketplace:souk.composer.noResale')}
        error={!!composer.fieldErrors.noResaleConsent}
      />
      {errorText('noResaleConsent') ? (
        <Text variant="caption" color="accent" testID="souk-composer-no-resale-error">
          {errorText('noResaleConsent')}
        </Text>
      ) : null}

      {composer.error ? (
        <Banner
          variant="error"
          message={t(soukErrorKey(composer.error))}
          testID="souk-composer-error"
        />
      ) : null}

      <Button
        fullWidth
        loading={composer.busy}
        leftIcon="gift"
        label={t('marketplace:souk.composer.submit')}
        onPress={() => {
          void submit();
        }}
        testID="souk-composer-submit"
      />
      <View style={{ height: theme.spacing[4] }} />
      <Icon name="shield" size={16} color={theme.colors.text.secondary} />
    </SoukScaffold>
  );
}
