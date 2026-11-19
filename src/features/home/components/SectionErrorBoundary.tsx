// Per-section boundary: a failing section never breaks the screen (D-8).
// Retry resets this boundary AND refetches only this section's query.
import { Component, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ErrorState } from '@/components/ui';
import { translate } from '@/i18n';
import { useTheme } from '@/theme';

export interface SectionErrorBoundaryProps {
  readonly children: ReactNode;
  readonly onRetry?: () => void;
  readonly testID?: string;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
}

function SectionFallback({
  onRetry,
  testID,
}: {
  readonly onRetry?: () => void;
  readonly testID?: string;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.wrapper, { paddingHorizontal: theme.spacing[4] }]}>
      <ErrorState
        title={translate('home:states.error')}
        description={translate('home:states.errorDescription')}
        onRetry={onRetry}
        testID={testID ? `${testID}-fallback` : undefined}
      />
    </View>
  );
}

export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  override state: SectionErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true };
  }

  private readonly handleRetry = (): void => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  };

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return <SectionFallback onRetry={this.handleRetry} testID={this.props.testID} />;
  }
}

const styles = StyleSheet.create({
  wrapper: { paddingVertical: 8 },
});
