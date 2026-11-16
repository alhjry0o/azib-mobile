import * as SecureStore from 'expo-secure-store';
import { REFRESH_TOKEN_KEY, createTokenVault } from '../token-vault';

describe('token vault', () => {
  beforeEach(async () => {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    jest.clearAllMocks();
  });

  it('persists tokens through SecureStore on native', async () => {
    const vault = createTokenVault('native');
    expect(vault.persistent).toBe(true);
    await vault.save('demo-refresh-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      REFRESH_TOKEN_KEY,
      'demo-refresh-token',
      { keychainAccessible: SecureStore.WHEN_UNLOCKED },
    );
    await expect(vault.read()).resolves.toBe('demo-refresh-token');
    await vault.clear();
    await expect(vault.read()).resolves.toBeNull();
  });

  it('never persists on web (memory only)', async () => {
    const vault = createTokenVault('web');
    expect(vault.persistent).toBe(false);
    await vault.save('web-token');
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    await expect(vault.read()).resolves.toBe('web-token');
    await vault.clear();
    await expect(vault.read()).resolves.toBeNull();
  });

  it('falls back to memory when SecureStore throws', async () => {
    (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error('no keychain'));
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('no keychain'));
    const vault = createTokenVault('native');
    await vault.save('fallback-token');
    await expect(vault.read()).resolves.toBe('fallback-token');
  });
});
