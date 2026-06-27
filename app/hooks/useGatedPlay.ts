import { useState, useCallback } from "react";
import { apiFetch } from "../lib/api";

function lsKey(email?: string) {
  return `newsletter_subscribed_${email || "anon"}`;
}

export function useGatedPlay(userEmail?: string) {
  const [gateOpen, setGateOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const key = lsKey(userEmail);

  const checkSubscribed = useCallback(async (): Promise<boolean> => {
    // Fast path: per-user localStorage flag
    if (typeof window !== "undefined" && localStorage.getItem(key) === "1") {
      return true;
    }
    try {
      const data = await apiFetch("/api/newsletter/me");
      if (data?.subscribed) {
        localStorage.setItem(key, "1");
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }, [key]);

  const requestPlay = useCallback(
    async (url: string, onPlay: (url: string) => void) => {
      const ok = await checkSubscribed();
      if (ok) {
        onPlay(url);
        return;
      }
      setPendingUrl(url);
      setGateOpen(true);
    },
    [checkSubscribed]
  );

  const onSubscribed = useCallback(
    (onPlay: (url: string) => void) => {
      localStorage.setItem(key, "1");
      setGateOpen(false);
      if (pendingUrl) {
        onPlay(pendingUrl);
        setPendingUrl(null);
      }
    },
    [pendingUrl, key]
  );

  const closeGate = useCallback(() => {
    setGateOpen(false);
    setPendingUrl(null);
  }, []);

  return { gateOpen, closeGate, requestPlay, onSubscribed };
}
