import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { User } from "../shared";

// The /api/auth/me check needs the user's session cookie. During SSR the
// browser is not involved, so credentials:"include" does nothing — we must
// pull the incoming request's Cookie header and forward it ourselves.
export const getMeServer = createServerFn({ method: "GET", strict: false }).handler(
  async (): Promise<User | null> => {
    const apiUrl =
      (import.meta.env.VITE_API_URL as string | undefined) ||
      "http://localhost:4004";
    const cookie = getRequestHeaders().get("cookie") ?? "";
    try {
      const res = await fetch(`${apiUrl}/api/auth/me`, {
        headers: cookie ? { cookie } : {},
      });
      if (!res.ok) return null;
      const data = await res.json();
      return (data?.user as User | undefined) ?? null;
    } catch {
      return null;
    }
  },
);

export const getSettingsServer = createServerFn({ method: "GET", strict: false }).handler(
  async (): Promise<Record<string, unknown>> => {
    const apiUrl =
      (import.meta.env.VITE_API_URL as string | undefined) ||
      "http://localhost:4004";
    try {
      const res = await fetch(`${apiUrl}/api/settings`);
      if (!res.ok) return {};
      const data = await res.json();
      return (data && typeof data === "object" ? data : {}) as Record<
        string,
        unknown
      >;
    } catch {
      return {};
    }
  },
);
