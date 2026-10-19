import Constants from 'expo-constants';

/**
 * Where the Spring Boot backend lives.
 *
 * Order of priority:
 * 1. EXPO_PUBLIC_API_URL (set it in a .env file if you need to force an address)
 * 2. The same PC that is running `expo start` (found automatically), port 8080
 * 3. localhost (works for the web version on the same PC)
 */
const BACKEND_PORT = 8080;

function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }

  // hostUri looks like "192.168.0.12:8081" when running on the local network
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri ? hostUri.split(':')[0] : null;

  return `http://${host ?? 'localhost'}:${BACKEND_PORT}`;
}

export const API_BASE_URL = resolveBaseUrl();
