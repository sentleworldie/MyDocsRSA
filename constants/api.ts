
import Constants from 'expo-constants';

/**
 * Backend configuration.
 * Production should use the hosted Render backend.
 */
const BACKEND_PORT = 8080;

function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;

  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '');
  }

  // Local development fallback
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri ? hostUri.split(':')[0] : null;

  return `http://${host ?? 'localhost'}:${BACKEND_PORT}`;
}

export const API_BASE_URL = resolveBaseUrl();
