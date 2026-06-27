import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { apiFetch } from "../lib/api";

function lsKey(email?: string) {
  return `newsletter_subscribed_${email || "anon"}`;
}

async function registerForEvent(eventId: string, email?: string) {
  try {
    await apiFetch(`/api/events/${eventId}/register`, {
      method: "POST",
      body: JSON.stringify({
        name: email ? email.split("@")[0] : "Subscriber",
        email: email || "",
        guests: 1,
      }),
    });
  } catch (err: any) {
    // ignore registration errors (e.g. already passed, fully booked, online-only)
    console.error("Auto seat reservation failed:", err);
  }
}

export function useGatedRegister(userEmail?: string) {
  const navigate = useNavigate();
  const [gateOpen, setGateOpen] = useState(false);
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const key = lsKey(userEmail);

  const checkSubscribed = useCallback(async (): Promise<boolean> => {
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

  const requestRegister = useCallback(
    async (eventId: string) => {
      const ok = await checkSubscribed();
      if (ok) {
        navigate({ to: "/events/$id", params: { id: eventId } });
        return;
      }
      setPendingEventId(eventId);
      setGateOpen(true);
    },
    [checkSubscribed, navigate]
  );

  const onSubscribed = useCallback(
    async (email?: string) => {
      localStorage.setItem(key, "1");
      setIsSubscribed(true);
      setGateOpen(false);
      if (pendingEventId) {
        await registerForEvent(pendingEventId, email || userEmail);
        navigate({ to: "/events/$id", params: { id: pendingEventId } });
        setPendingEventId(null);
      }
    },
    [pendingEventId, key, navigate, userEmail]
  );

  const closeGate = useCallback(() => {
    setGateOpen(false);
    setPendingEventId(null);
  }, []);

  useEffect(() => {
    checkSubscribed().then(setIsSubscribed);
  }, [checkSubscribed]);

  return { gateOpen, closeGate, requestRegister, onSubscribed, isSubscribed };
}
