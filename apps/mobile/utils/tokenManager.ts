import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'workforce_user_token';

// AFTER_FIRST_UNLOCK: token remains accessible after the device has been
// unlocked at least once since a restart — even if the screen is locked again.
// This is required so background location tasks can read auth credentials
// without triggering iOS "User interaction is not allowed" keychain errors.
const STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

export async function saveToken(value: string) {
  if (!value || value === 'null' || value === 'undefined') return;
  await SecureStore.setItemAsync(TOKEN_KEY, value, STORE_OPTIONS);
}

export async function getToken(): Promise<string | null> {
  const value = await SecureStore.getItemAsync(TOKEN_KEY, STORE_OPTIONS);
  // Guard against corrupted/stringified-null values that slip through
  if (!value || value === 'null' || value === 'undefined') return null;
  return value;
}

export async function deleteToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY, STORE_OPTIONS);
}
