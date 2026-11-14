// Unified honest placeholder for unbuilt sections.
// Always states which phase builds the feature. No dead buttons:
// the only optional button is a real, caller-provided action.
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, Icon, Screen, Text, type IconName } from '@/components/ui';
import { useTheme } from '@/theme';

export interface RoutePlaceholderAction {
  readonly label: string;
  readonly onPress: () => void;
}

export interface RoutePlaceholderProps {
  readonly title: string;
  readonly description: string;
  /** Phase tag, e.g. 'P08'. Displayed via i18n interpolation. */
  readonly phase: string;
  readonly icon?: IconName;
  readonly action?: RoutePlaceholderAction;
  readonly testID?: string;
}

export function RoutePlaceholder({
  title,
  description,
  phase,
  icon = 'sparkles',
  action,
  testID,
}: RoutePlaceholderProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Screen
      scroll
      testID={testID}
      contentStyle={[
        styles.content,
        { paddingBottom: theme.spacing[12], gap: theme.spacing[4] },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          {
            borderColor: theme.colors.accent.fill,
            backgroundColor: 'rgba(155,92,255,0.16)',
          },
        ]}
      >
        <Icon name={icon} size={28} color={theme.colors.text.accent} />
      </View>
      <Text variant="h2" align="center">
        {title}
      </Text>
      <Text variant="body" color="secondary" align="center">
        {description}
      </Text>
      <Badge
        variant="pending"
        label={t('common:shell.placeholder.builtIn', { phase })}
        testID={testID ? `${testID}-phase` : undefined}
      />
      {action ? (
        <Button
          variant="secondary"
          label={action.label}
          onPress={action.onPress}
          style={styles.action}
          testID={testID ? `${testID}-action` : undefined}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: { alignSelf: 'stretch', maxWidth: 280 },
});
