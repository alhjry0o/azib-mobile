import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from '@testing-library/react-native';
import { ToastProvider } from '@/components/ui';
import { Providers } from '@/components/ui/__tests__/test-utils';
import { setLanguage } from '@/i18n';
import { ProviderContainerProvider } from '@/providers';
import type { AuthSession } from '@/providers';
import { useAppModeStore, useOnboardingStore, useShellStore } from '@/stores';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
}

export function ShellProviders({
  children,
  client,
}: {
  children: ReactNode;
  client?: QueryClient;
}) {
  const [queryClient] = useState(() => client ?? createTestQueryClient());
  return (
    <Providers>
      <QueryClientProvider client={queryClient}>
        <ProviderContainerProvider>
          <ToastProvider>{children}</ToastProvider>
        </ProviderContainerProvider>
      </QueryClientProvider>
    </Providers>
  );
}

export async function resetShellStores(): Promise<void> {
  await act(async () => {
    useAppModeStore.setState({ mode: 'demo', hydrated: true });
    useOnboardingStore.setState({ completed: false, hydrated: true });
    useShellStore.setState({
      dialog: null,
      sheet: null,
      demoBannerDismissed: false,
      unreadNotifications: 0,
    });
  });
}

export async function resetLanguageToArabic(): Promise<void> {
  await act(async () => {
    await setLanguage('ar');
  });
}

export function makeDemoSession(): AuthSession {
  return {
    user: {
      id: 'demo-user-test',
      email: 'demo@azib.invalid',
      phone: null,
      displayName: 'Demo User',
      dataOrigin: 'demo',
      createdAt: new Date().toISOString(),
    },
    expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
  };
}
