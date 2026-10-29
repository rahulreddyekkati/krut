// fetch() with a deadline. React Native's fetch has no timeout of its own, so when the server
// hangs the request (and the screen's loading spinner) waits indefinitely. On timeout this
// rejects like any network failure, so callers' existing catch blocks handle it.
export const DEFAULT_TIMEOUT_MS = 20000;

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  // Respect a caller-supplied signal too
  options.signal?.addEventListener("abort", () => controller.abort());
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}
