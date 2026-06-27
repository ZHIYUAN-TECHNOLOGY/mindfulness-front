import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "./__root";

interface MembershipConfig {
  enabled: boolean;
  priceDisplay: string;
  currency: string;
  isEarlyBird: boolean;
  earlyBirdUntil: string | null;
  regularPriceDisplay: string;
  earlyBirdPriceDisplay: string | null;
  label: string;
}

export const Route = createFileRoute("/membership")({
  component: MembershipPage,
});

function formatCurrency(amount: string, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(Number(amount));
  } catch {
    return `${currency.toUpperCase()} ${amount}`;
  }
}

function MembershipPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [config, setConfig] = useState<MembershipConfig>({
    enabled: false,
    priceDisplay: "49",
    currency: "USD",
    isEarlyBird: false,
    earlyBirdUntil: null,
    regularPriceDisplay: "49",
    earlyBirdPriceDisplay: null,
    label: "Regular",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/api/stripe/config").then(setConfig).catch(() => {});
  }, []);

  const startCheckout = async () => {
    if (!user) {
      navigate({ to: "/login", search: { redirect: "/membership" } });
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch("/api/stripe/create-checkout-session", {
        method: "POST",
      });
      window.location.href = data.url;
    } catch (err: any) {
      alert(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = formatCurrency(config.priceDisplay, config.currency);
  const regularPrice = formatCurrency(config.regularPriceDisplay, config.currency);

  return (
    <main className="container-editorial" style={{ paddingTop: "clamp(120px, 16vw, 180px)" }}>
      <span className="eyebrow">Members pass</span>
      <h1 className="display display-l mt-6">
        Thirty days of <span className="italic-accent">quiet access.</span>
      </h1>

      <div className="grid md:grid-cols-2 gap-12 mt-12">
        <div>
          <p className="lead">
            One pass unlocks every members-only event recording and every locked chapter for 30 days.
          </p>
          <ul className="mt-6 space-y-3 body-prose" style={{ listStyle: "none", padding: 0 }}>
            <li>Members-only HEARTtalk recordings inside events</li>
            <li>Locked book chapters and early releases</li>
            <li>Watch on any device</li>
            <li>Renew or stack passes anytime</li>
          </ul>
        </div>

        <div
          className="p-8 rounded-lg border border-gold-light/10"
          style={{ background: "var(--paper-soft)" }}
        >
          <p className="eyebrow">30-day pass</p>
          <p className="display display-m mt-2">
            {currentPrice}
            {config.isEarlyBird && config.earlyBirdPriceDisplay && (
              <span className="ml-3 text-lg line-through text-gold-light/60">
                {regularPrice}
              </span>
            )}
          </p>
          {config.isEarlyBird && config.earlyBirdUntil && (
            <p className="body-prose mt-2 text-gold-light">
              Early-bird price ends{" "}
              <strong>{new Date(config.earlyBirdUntil).toLocaleDateString()}</strong>.
            </p>
          )}
          {!config.isEarlyBird && (
            <p className="body-prose mt-2 text-gold-light">One-time payment. No recurring billing.</p>
          )}
          <button
            onClick={startCheckout}
            disabled={loading || !config.enabled}
            className="btn-ed btn-primary w-full justify-center mt-6 disabled:opacity-50"
          >
            {loading ? "Opening checkout…" : config.isEarlyBird ? "Get early-bird pass" : "Get 30-day pass"}
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>
    </main>
  );
}
