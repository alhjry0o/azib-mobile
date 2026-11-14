import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { StateView, type StateViewAction } from './StateView';
import type { IconName } from './Icon';

export interface EmptyStateProps {
  /** Overrides `t('common.states.empty')`. */
  readonly title?: string;
  readonly description?: string;
  readonly icon?: IconName;
  readonly illustration?: ReactNode;
  readonly action?: StateViewAction;
  readonly secondaryAction?: StateViewAction;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function EmptyState({
  title,
  description,
  icon = 'shoppingBag',
  illustration,
  action,
  secondaryAction,
  style,
  testID,
}: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    <StateView
      icon={icon}
      illustration={illustration}
      tone="neutral"
      title={title ?? t('common.states.empty')}
      description={description}
      action={action}
      secondaryAction={secondaryAction}
      style={style}
      testID={testID}
    />
  );
}
