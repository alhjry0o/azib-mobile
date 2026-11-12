// Reads current direction from i18n + I18nManager.

import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export interface DirectionInfo {
  readonly isRTL: boolean;
  readonly direction: 'rtl' | 'ltr';
}

export function useDirection(): DirectionInfo {
  const { i18n } = useTranslation();
  return useMemo<DirectionInfo>(() => {
    const isRTL = i18n.language.startsWith('ar') || I18nManager.isRTL;
    return { isRTL, direction: isRTL ? 'rtl' : 'ltr' };
  }, [i18n.language]);
}
