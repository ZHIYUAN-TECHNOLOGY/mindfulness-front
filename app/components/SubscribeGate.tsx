import { useState } from "react";
import { apiFetch } from "../lib/api";

export type GateCopy = {
  eyebrow?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  successTitle?: React.ReactNode;
  successDescription?: React.ReactNode;
  ctaText?: string;
};

export function SubscribeGate({
  open,
  onClose,
  onSubscribed,
  defaultEmail = "",
  copy,
}: {
  open: boolean;
  onClose: () => void;
  onSubscribed: (email?: string) => void;
  defaultEmail?: string;
  copy?: GateCopy;
}) {
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      });
      setSuccess(true);
      const subscribedEmail = email.trim();
      setTimeout(() => {
        onSubscribed(subscribedEmail);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const eyebrow = copy?.eyebrow ?? (success ? "Thank you" : "Watch this");
  const title = copy?.title ?? (
    <>
      Subscribe to
      <br />
      <span className="italic-accent">unlock.</span>
    </>
  );
  const description = copy?.description ?? (
    <>
      Enter your email below to join the newsletter and get instant
      access to every video and conversation.
    </>
  );
  const successTitle = copy?.successTitle ?? "You're in.";
  const successDescription = copy?.successDescription ?? (
    <>Welcome to the list — your video is opening now.</>
  );
  const ctaText = copy?.ctaText ?? "Subscribe & watch";

  return (
    <div
      className="subscribe-gate"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Subscribe to continue"
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

        {success ? (
          <div className="subscribe-gate__body">
            <span className="eyebrow-bare">{eyebrow}</span>
            <h2 className="display display-s mt-5">{successTitle}</h2>
            <p className="lead mt-4">{successDescription}</p>
          </div>
        ) : (
          <div className="subscribe-gate__body">
            <span className="eyebrow-bare">{eyebrow}</span>
            <h2 className="display display-s mt-5">{title}</h2>
            <p className="lead mt-4">{description}</p>

            <form onSubmit={handleSubmit} className="subscribe-gate__form">
              <div className="field">
                <label htmlFor="sg-email">Email</label>
                <input
                  id="sg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
              <div className="field">
                <label htmlFor="sg-name">Name (optional)</label>
                <input
                  id="sg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={loading}
                />
              </div>
              {error && <p className="subscribe-gate__error">{error}</p>}
              <button
                type="submit"
                className="btn-ed btn-primary w-full justify-center"
                disabled={loading}
              >
                {loading ? "Subscribing..." : ctaText}
                <span className="btn-arrow">→</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
