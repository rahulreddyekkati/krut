import { getToken } from "./tokenManager";

const API_BASE_URL = "https://krut-6zbd.vercel.app/api"; // Default production build URL

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = await getToken();
  
  const headers = new Headers(options.headers || {});
  // Add timezone offset in minutes (e.g. 300 for -05:00) 
  // This helps the server handle local time vs UTC correctly
  headers.set("x-timezone-offset", new Date().getTimezoneOffset().toString());
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}
