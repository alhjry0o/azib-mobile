import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { StateView, type StateViewAction } from './StateView';
import type { IconName } from './Icon';

export interface NotConnectedStateProps {
  /** Overrides `t('errors.notConnected')`. */
  readonly title?: string;
  readonly description?: string;
  readonly icon?: IconName;
  readonly illustration?: ReactNode;
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
  readonly secondaryAction?: StateViewAction;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function NotConnectedState({
  title,
  description,
  icon = 'info',
  illustration,
  onRetry,
  retryLabel,
  secondaryAction,
  style,
  testID,
}: NotConnectedStateProps) {
  const { t } = useTranslation();
  const action: StateViewAction | undefined = onRetry
    ? {
        label: retryLabel ?? t('buttons.retry'),
        onPress: onRetry,
        variant: 'primary',
      }
    : undefined;

  return (
    <StateView
      icon={icon}
      illustration={illustration}
      tone="accent"
      title={title ?? t('errors.notConnected')}
      description={description}
      action={action}
      secondaryAction={secondaryAction}
      style={style}
      testID={testID}
    />
  );
}
