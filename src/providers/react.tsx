// ProviderContainerProvider — React context that holds a single container
// and rebuilds it when the AppMode changes.
//
// Usage in app/_layout.tsx:
//   <ProviderContainerProvider><Root /></ProviderContainerProvider>
//
// Usage in a component:
//   const { auth, payment, registry } = useProviderContainer();

import { createContext, useContext, useMemo, type ReactNode, type ReactElement } from 'react';

import { env } from '@/config/env';
import { useAppModeStore } from '@/stores/app-mode.store';

import { createProviderContainer, type ProviderContainer } from './container';

const ProviderContainerContext = createContext<ProviderContainer | null>(null);

export interface ProviderContainerProviderProps {
  readonly children: ReactNode;
}

export function ProviderContainerProvider({
  children,
}: ProviderContainerProviderProps): ReactElement {
  const mode = useAppModeStore((s) => s.mode);

  const container = useMemo<ProviderContainer>(
    () => createProviderContainer({ mode, env }),
    [mode],
  );

  return (
    <ProviderContainerContext.Provider value={container}>
      {children}
    </ProviderContainerContext.Provider>
  );
}

export function useProviderContainer(): ProviderContainer {
  const c = useContext(ProviderContainerContext);
  if (!c) {
    throw new Error(
      'useProviderContainer must be used within <ProviderContainerProvider>. ' +
        'Wrap your root layout with it.',
    );
  }
  return c;
}
