import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Banner, Text } from '@/components/ui';
import { useTheme } from '@/theme';

export interface WizardStepShellProps {
  readonly testID: string;
  readonly title: string;
  readonly whyKey: string;
  readonly children: ReactNode;
}

export function WizardStepShell({ testID, title, whyKey, children }: WizardStepShellProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { gap: theme.spacing[3] }]} testID={testID}>
      <Text variant="h2">{title}</Text>
      <Banner variant="info" message={t(whyKey)} testID={`${testID}-why`} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
});
