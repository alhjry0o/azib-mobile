import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Banner,
  Button,
  NotConnectedState,
  Screen,
  Select,
  Skeleton,
  TextInput,
  useToast,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import { ProfileFormSchema } from '@/schemas/profile-form';
import { useTheme } from '@/theme';
import { AvatarPicker } from '../components/AvatarPicker';
import { LocationCascade } from '../components/LocationCascade';
import { deepestId, isValidChain, selectionFromId } from '../locations';
import { useProfile } from '../use-profile';

const GENDERS = ['male', 'female', 'unspecified'] as const;
const MARITAL = ['single', 'engaged', 'married', 'divorced', 'widowed'] as const;

export function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const container = useProviderContainer();
  const profileApi = useProfile();
  const profile = profileApi.profile;

  const { control, handleSubmit, formState, reset, setValue, watch } = useForm({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      displayName: '',
      gender: 'unspecified' as (typeof GENDERS)[number],
      maritalStatus: 'single' as (typeof MARITAL)[number],
      governorateId: '',
      districtId: '',
      areaId: null as string | null,
    },
  });

  useEffect(() => {
    if (!profile) return;
    const selection = selectionFromId(profile.city);
    reset({
      displayName: profile.displayName,
      gender: profile.gender,
      maritalStatus: profile.maritalStatus,
      governorateId: selection.governorateId ?? '',
      districtId: selection.districtId ?? '',
      areaId: selection.areaId,
    });
  }, [profile, reset]);

  const governorateId = watch('governorateId');
  const districtId = watch('districtId');
  const areaId = watch('areaId');
  const displayName = watch('displayName');

  if (container.mode === 'backend') {
    return (
      <Screen testID="edit-profile-screen" style={styles.center}>
        <NotConnectedState
          title={t('profile:notConnectedYet')}
          description={t('profile:settings.serverNote')}
          onRetry={profileApi.refetch}
        />
      </Screen>
    );
  }

  if (profileApi.isLoading) {
    return (
      <Screen testID="edit-profile-loading" contentStyle={styles.content}>
        <Skeleton variant="text" />
        <Skeleton variant="rect" height={48} />
        <Skeleton variant="rect" height={48} />
      </Screen>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    const selection = {
      governorateId: values.governorateId,
      districtId: values.districtId,
      areaId: values.areaId,
    };
    if (!isValidChain(selection)) {
      toast.show({ message: t('profile:validation.chain'), variant: 'error' });
      return;
    }
    const saved = await profileApi.save({
      displayName: values.displayName,
      gender: values.gender,
      maritalStatus: values.maritalStatus,
      city: deepestId(selection),
    });
    if (!saved.ok) {
      toast.show({ message: t('profile:error.description'), variant: 'error' });
      return;
    }
    toast.show({ message: t('profile:edit.success'), variant: 'success' });
    router.replace(href(ROUTES.profile.root));
  });

  return (
    <Screen
      scroll
      testID="edit-profile-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.profile.root))}
        testID="edit-profile-back"
        style={styles.back}
      />
      <Banner variant="demo" message={t('profile:edit.subtitle')} testID="edit-profile-demo" />
      <AvatarPicker name={displayName || 'AZIB'} testID="edit-avatar" />
      <Controller
        control={control}
        name="displayName"
        render={({ field }) => (
          <TextInput
            testID="edit-display-name"
            label={t('profile:fields.displayName')}
            required
            leftIcon="user"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={
              formState.errors.displayName?.message
                ? t(String(formState.errors.displayName.message))
                : undefined
            }
          />
        )}
      />
      <Controller
        control={control}
        name="gender"
        render={({ field }) => (
          <Select
            testID="edit-gender"
            label={t('profile:fields.gender')}
            value={field.value}
            options={GENDERS.map((g) => ({ value: g, label: t(`profile:gender.${g}`) }))}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="maritalStatus"
        render={({ field }) => (
          <Select
            testID="edit-marital"
            label={t('profile:fields.maritalStatus')}
            value={field.value}
            options={MARITAL.map((m) => ({ value: m, label: t(`profile:marital.${m}`) }))}
            onChange={field.onChange}
          />
        )}
      />
      <LocationCascade
        governorateId={governorateId || null}
        districtId={districtId || null}
        areaId={areaId}
        onGovernorateChange={(id) => {
          setValue('governorateId', id, { shouldValidate: true });
          setValue('districtId', '');
          setValue('areaId', null);
        }}
        onDistrictChange={(id) => {
          setValue('districtId', id, { shouldValidate: true });
          setValue('areaId', null);
        }}
        onAreaChange={(id) => setValue('areaId', id)}
        errors={{
          governorate: formState.errors.governorateId?.message
            ? t(String(formState.errors.governorateId.message))
            : undefined,
          district: formState.errors.districtId?.message
            ? t(String(formState.errors.districtId.message))
            : undefined,
        }}
      />
      <Button
        fullWidth
        loading={profileApi.busy}
        label={t('profile:edit.save')}
        onPress={() => {
          void onSubmit();
        }}
        testID="edit-profile-save"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  content: { gap: 12, paddingVertical: 16 },
  back: { alignSelf: 'flex-start', marginTop: 8 },
});
