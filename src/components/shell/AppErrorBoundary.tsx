// Top-level error boundary. The fallback deliberately avoids theme/i18n hooks
// (providers themselves may have crashed), so it uses static tokens + translate().
import { Component, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { translate } from '@/i18n';
import { palette, typography } from '@/theme';

interface AppErrorBoundaryProps {
  readonly children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  override state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  private readonly handleReset = (): void => {
    this.setState({ hasError: false });
  };

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.fallback} testID="error-boundary">
        <Text style={[typography.h2, styles.title]}>
          {translate('common:shell.errorBoundary.title')}
        </Text>
        <Text style={[typography.body, styles.description]}>
          {translate('common:shell.errorBoundary.description')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={translate('common:buttons.retry')}
          onPress={this.handleReset}
          testID="error-boundary-retry"
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={[typography.bodyStrong, styles.buttonText]}>
            {translate('common:buttons.retry')}
          </Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    backgroundColor: palette.black[900],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: { color: palette.white, textAlign: 'center' },
  description: { color: palette.neutral[100], textAlign: 'center' },
  button: {
    backgroundColor: palette.purple[600],
    borderRadius: 16,
    paddingHorizontal: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.85 },
  buttonText: { color: palette.white },
});
