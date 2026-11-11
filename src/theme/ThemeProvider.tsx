import { createContext, useMemo, type ReactElement, type ReactNode } from 'react';

import { darkTheme, type Theme } from './themes/dark';

export const ThemeContext = createContext<Theme | null>(null);

export interface ThemeProviderProps {
  readonly children: ReactNode;
  /** Reserved for P05+ (light theme). Not used yet. */
  readonly theme?: Theme;
}

export function ThemeProvider({ children, theme }: ThemeProviderProps): ReactElement {
  const value = useMemo<Theme>(() => theme ?? darkTheme, [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
