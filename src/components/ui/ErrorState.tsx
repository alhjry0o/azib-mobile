import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { StateView, type StateViewAction } from './StateView';
import type { IconName } from './Icon';

export interface ErrorStateProps {
  /** Overrides `t('errors.unknown')`. */
  readonly title?: string;
  readonly description?: string;
  readonly icon?: IconName;
  readonly illustration?: ReactNode;
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
  readonly retrying?: boolean;
  readonly secondaryAction?: StateViewAction;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function ErrorState({
  title,
  description,
  icon = 'alertCircle',
  illustration,
  onRetry,
  retryLabel,
  retrying = false,
  secondaryAction,
  style,
  testID,
}: ErrorStateProps) {
  const { t } = useTranslation();
  const action: StateViewAction | undefined = onRetry
    ? {
        label: retryLabel ?? t('buttons.retry'),
        onPress: onRetry,
        variant: 'primary',
        loading: retrying,
      }
    : undefined;

  return (
    <StateView
      icon={icon}
      illustration={illustration}
      tone="danger"
      title={title ?? t('errors.unknown')}
      description={description}
      action={action}
      secondaryAction={secondaryAction}
      style={style}
      testID={testID}
    />
  );
}
