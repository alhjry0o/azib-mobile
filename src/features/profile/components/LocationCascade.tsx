// Governorate -> district -> area. Options come from the demo tree;
// each level resets its children when the parent changes.
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Select, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { childrenOf, type SeedLocation } from '../locations';

export interface LocationCascadeProps {
  readonly governorateId: string | null;
  readonly districtId: string | null;
  readonly areaId: string | null;
  readonly onGovernorateChange: (id: string) => void;
  readonly onDistrictChange: (id: string) => void;
  readonly onAreaChange: (id: string) => void;
  readonly errors?: {
    readonly governorate?: string;
    readonly district?: string;
  };
}

function toOptions(rows: readonly SeedLocation[], t: (key: string) => string) {
  return rows.map((row) => ({ value: row.id, label: t(row.nameKey) }));
}

export function LocationCascade({
  governorateId,
  districtId,
  areaId,
  onGovernorateChange,
  onDistrictChange,
  onAreaChange,
  errors,
}: LocationCascadeProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const governorates = childrenOf(null);
  const districts = governorateId ? childrenOf(governorateId) : [];
  const areas = districtId ? childrenOf(districtId) : [];

  return (
    <View style={[styles.container, { gap: theme.spacing[3] }]}>
      <Select
        testID="edit-governorate"
        label={t('profile:fields.governorate')}
        required
        placeholder={t('profile:fields.governorate')}
        value={governorateId}
        options={toOptions(governorates, t)}
        onChange={onGovernorateChange}
        errorText={errors?.governorate}
      />
      <Select
        testID="edit-district"
        label={t('profile:fields.district')}
        required
        placeholder={t('profile:fields.district')}
        value={districtId}
        options={toOptions(districts, t)}
        onChange={onDistrictChange}
        disabled={!governorateId}
        errorText={errors?.district}
      />
      <Select
        testID="edit-area"
        label={t('profile:fields.area')}
        placeholder={t('profile:fields.area')}
        value={areaId}
        options={toOptions(areas, t)}
        onChange={onAreaChange}
        disabled={!districtId || areas.length === 0}
      />
      <Text variant="caption" color="secondary">
        {t('profile:locations.pending')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
});
