import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface NotConnectedScreenProps {
  /** Optional feature name shown as a subtitle. Defaults to nothing. */
  readonly featureName?: string;
  /** Called when the user taps Retry. */
  readonly onRetry?: () => void;
}

/**
 * Honest "not connected" screen. Used when a backend adapter is disabled,
 * when a repo is unimplemented, or when env is incomplete.
 * Never claims success; never hides the state.
 */
export function NotConnectedScreen({ featureName, onRetry }: NotConnectedScreenProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap} accessibilityElementsHidden>
        <View style={styles.iconDot} />
      </View>
      {featureName ? <Text style={styles.feature}>{featureName}</Text> : null}
      <Text style={styles.title}>{t('errors.notConnected')}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>{t('buttons.retry')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09080F',
    paddingHorizontal: 24,
    gap: 16,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#7136C9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#9B5CFF',
  },
  feature: {
    color: '#F0CA68',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
  },
  button: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#7136C9',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
