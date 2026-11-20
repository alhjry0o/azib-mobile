// Shared section chrome: header + the four honest states + content.
// P07.2 adds an optional empty-state action (additive, no caller breakage).
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  EmptyState,
  ErrorState,
  NotConnectedState,
  SectionHeader,
  Skeleton,
  type IconName,
} from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/theme';
import type { HomeSectionStatus } from '../hooks/use-home-section';

export interface SectionShellEmptyAction {
  readonly label: string;
  readonly onPress: () => void;
}

export interface SectionShellProps {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly status: HomeSectionStatus;
  readonly emptyTitle: string;
  readonly emptyDescription?: string;
  readonly emptyIcon?: IconName;
  readonly emptyAction?: SectionShellEmptyAction;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly onRetry?: () => void;
  readonly children?: ReactNode;
}

export function SectionShell({
  id,
  title,
  subtitle,
  status,
  emptyTitle,
  emptyDescription,
  emptyIcon = 'info',
  emptyAction,
  actionLabel,
  onAction,
  onRetry,
  children,
}: SectionShellProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[styles.container, { paddingHorizontal: theme.spacing[4], gap: theme.spacing[2] }]}
      testID={`section-${id}`}
    >
      <SectionHeader
        title={title}
        subtitle={subtitle}
        actionLabel={status === 'ready' ? actionLabel : undefined}
        onAction={status === 'ready' ? onAction : undefined}
        testID={`section-${id}-header`}
      />
      {status === 'loading' ? (
        <View style={{ gap: theme.spacing[2] }} testID={`section-${id}-loading`}>
          <Skeleton variant="rect" height={110} />
          <Skeleton variant="text" width="60%" />
        </View>
      ) : null}
      {status === 'error' ? (
        <ErrorState
          title={t('home:states.error')}
          description={t('home:states.errorDescription')}
          onRetry={onRetry}
          testID={`section-${id}-error`}
        />
      ) : null}
      {status === 'not-connected' ? (
        <NotConnectedState
          title={t('home:states.notConnected')}
          description={t('home:states.notConnectedDescription')}
          onRetry={onRetry}
          testID={`section-${id}-not-connected`}
        />
      ) : null}
      {status === 'empty' ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          testID={`section-${id}-empty`}
        />
      ) : null}
      {status === 'ready' ? children : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 12 },
});
