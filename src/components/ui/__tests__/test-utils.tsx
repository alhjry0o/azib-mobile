import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@/i18n';
import { ThemeProvider } from '@/theme';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>{children}</ThemeProvider>
    </I18nextProvider>
  );
}
