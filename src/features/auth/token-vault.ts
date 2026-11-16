// Refresh-token storage. SecureStore on device; MEMORY ONLY on web (D-4).
// Tokens are never logged, never placed in Zustand, never in Query keys.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const REFRESH_TOKEN_KEY = 'azib.auth.refresh.v1';

export type VaultPlatform = 'native' | 'web';

export interface TokenVault {
  readonly persistent: boolean;
  save(token: string): Promise<void>;
  read(): Promise<string | null>;
  clear(): Promise<void>;
}

export function createTokenVault(
  platform: VaultPlatform = Platform.OS === 'web' ? 'web' : 'native',
): TokenVault {
  let memory: string | null = null;

  if (platform === 'web') {
    return Object.freeze({
      persistent: false,
      async save(token: string): Promise<void> {
        memory = token;
      },
      async read(): Promise<string | null> {
        return memory;
      },
      async clear(): Promise<void> {
        memory = null;
      },
    });
  }

  return Object.freeze({
    persistent: true,
    async save(token: string): Promise<void> {
      memory = token;
      try {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED,
        });
      } catch {
        // Storage unavailable (e.g. no keychain): keep the in-memory copy only.
      }
    },
    async read(): Promise<string | null> {
      try {
        const stored = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        return stored ?? memory;
      } catch {
        return memory;
      }
    },
    async clear(): Promise<void> {
      memory = null;
      try {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      } catch {
        // Nothing to delete.
      }
    },
  });
}
