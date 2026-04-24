import { getToken, deleteToken } from "./tokenManager";
import { router } from "expo-router";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://krut-6zbd.vercel.app/api";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getToken();

  const headers = new Headers(options.headers || {});
  // Send full IANA timezone (e.g. "America/Chicago") for DST-aware server logic
  headers.set("x-timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
  // Keep numeric offset as backward-compatible fallback
  headers.set("x-timezone-offset", new Date().getTimezoneOffset().toString());
  // Identifies this as the mobile app — used by clock-in API to reject web-browser requests
  headers.set("x-app-client", "mobile-app");

  if (token) {
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
