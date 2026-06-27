function getApiUrl(): string {
  // In the browser, always use a same-origin relative path. Both nginx (prod)
  // and the Vite dev server proxy "/api" to the API, so this works for
  // localhost, LAN IPs, and the public HTTPS domain with no mixed-content risk.
  if (typeof window !== "undefined") return "";
  // During SSR there is no origin to be relative to, so call the API directly
  // over localhost (server-to-server, no browser involved).
  return (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:4004";
}

export const API_URL = getApiUrl();

// Always the full base URL, even in browser (for media URLs that must be absolute
// and work from any origin, e.g. video/image src attributes).
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:4004";

if (import.meta.env.DEV) {
  console.info(`[api] Using API URL: ${API_URL}`);
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);

  if (typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    let message = "Request failed";
    if (typeof err.error === "string") {
      message = err.error;
    } else if (typeof err.message === "string") {
      message = err.message;
    } else if (err.error) {
      message = JSON.stringify(err.error);
    }
    throw new Error(message);
  }
  return res.json();
}
