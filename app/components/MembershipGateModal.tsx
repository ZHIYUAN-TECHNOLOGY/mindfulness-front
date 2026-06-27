import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../routes/__root";
import { apiFetch } from "../lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MembershipGateModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const startCheckout = async () => {
    if (!user) {
      navigate({ to: "/membership" });
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/stripe/create-checkout-session", {
        method: "POST",
      });
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="subscribe-gate"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Members only"
    >
      <div
        className="subscribe-gate__content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="subscribe-gate__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="subscribe-gate__body">
          <span className="eyebrow-bare">Members only</span>
          <h2 className="display display-s mt-5">
            This recording is for{" "}
            <span className="italic-accent">members.</span>
          </h2>
          <p className="lead mt-4">
            Get a 30-day pass to unlock every members-only event recording and
            every locked chapter.
          </p>

          {error && (
            <p className="text-sm text-red-600 mt-4">{error}</p>
          )}

          <button
            type="button"
            onClick={startCheckout}
            disabled={loading}
            className="btn-ed btn-primary w-full justify-center mt-7"
          >
            {loading
              ? "Opening checkout…"
              : user
                ? "Get 30-day pass"
                : "Log in to get pass"}
            <span className="btn-arrow">→</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn-link mt-4 inline-flex"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
