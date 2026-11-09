// RTL helpers. Direction is a *native layout* concern: changes require app reload.
// The Developer Settings screen (P05) will call needsReloadForLanguageChange() and prompt the user.

import { I18nManager } from 'react-native';

import { isRTL, type SupportedLanguage } from './config';

export function currentLayoutIsRTL(): boolean {
  return I18nManager.isRTL;
}

export function directionFor(language: SupportedLanguage): 'rtl' | 'ltr' {
  return isRTL(language) ? 'rtl' : 'ltr';
}

/**
 * Returns true when switching between the two languages would change the layout direction.
 * In that case the caller must inform the user and trigger an app reload.
 */
export function needsReloadForLanguageChange(
  currentLanguage: SupportedLanguage,
  nextLanguage: SupportedLanguage,
): boolean {
  return isRTL(currentLanguage) !== isRTL(nextLanguage);
}

/**
 * Applies the direction to the native layer. Full effect requires app reload.
 * Called from Developer Settings (P05) when the user changes language.
 */
export function applyDirectionToNativeLayer(language: SupportedLanguage): void {
  const rtl = isRTL(language);
  I18nManager.allowRTL(rtl);
  I18nManager.forceRTL(rtl);
}
