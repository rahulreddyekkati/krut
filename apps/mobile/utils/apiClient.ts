import { getToken, deleteToken } from "./tokenManager";
import { router } from "expo-router";

// Must be the real custom domain, not a raw Vercel project-alias (*.vercel.app) URL —
// once a custom domain is set as "Production" in Vercel, the auto-generated alias
// permanently 308-redirects to it, and that cross-origin redirect strips the
// Authorization header per the Fetch spec, silently breaking every authenticated call.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://www.krutotastes.com/api";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getToken();

  const headers = new Headers(options.headers || {});
  // Send full IANA timezone (e.g. "America/Chicago") for DST-aware server logic
  headers.set("x-timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
  // Keep numeric offset as backward-compatible fallback
  headers.set("x-timezone-offset", new Date().getTimezoneOffset().toString());
  // Identifies this as the mobile app — used by clock-in API to reject web-browser requests
  headers.set("x-app-client", "mobile-app");

  // Only attach Authorization if we have a real token (not null/undefined/empty)
  if (token && token !== "null" && token !== "undefined") {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Intercept 401 responses — JWT expired or revoked → redirect to login
  if (response.status === 401) {
    await deleteToken();
    try {
      router.replace("/login");
    } catch {
      // If router is not available yet (e.g. during app init), ignore
    }
    return response;
  }

  return response;
}
