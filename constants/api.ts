<<<<<<< HEAD
import Constants from "expo-constants";
=======
import Constants from 'expo-constants';
>>>>>>> parent of 0a0a1f7 (Merge branch 'main' of https://github.com/sentleworldie/MyApp)

/**
 * Where the Spring Boot backend lives.
 *
 * Order of priority:
 * 1. EXPO_PUBLIC_API_URL (set it in a .env file if you need to force an address)
 * 2. The same PC that is running `expo start` (found automatically), port 8080
 * 3. localhost (works for the web version on the same PC)
 */
<<<<<<< HEAD

const RENDER_API_URL = "https://mydocsrsa-1.onrender.com";
=======
>>>>>>> parent of 0a0a1f7 (Merge branch 'main' of https://github.com/sentleworldie/MyApp)
const BACKEND_PORT = 8080;

function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) {
<<<<<<< HEAD
    return fromEnv.replace(/\/+$/, "");
=======
    return fromEnv.replace(/\/$/, '');
>>>>>>> parent of 0a0a1f7 (Merge branch 'main' of https://github.com/sentleworldie/MyApp)
  }

  // hostUri looks like "192.168.0.12:8081" when running on the local network
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri ? hostUri.split(":")[0] : null;

  return `http://${host ?? "localhost"}:${BACKEND_PORT}`;
}

export const API_BASE_URL = resolveBaseUrl();
