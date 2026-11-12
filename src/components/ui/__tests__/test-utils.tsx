import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { i18n } from '@/i18n';
import { ThemeProvider } from '@/theme';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        {/* initialMetrics are required for tests to avoid async layout errors */}
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 320, height: 640 },
            insets: { top: 0, left: 0, right: 0, bottom: 0 },
          }}
        >
          {children}
        </SafeAreaProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
