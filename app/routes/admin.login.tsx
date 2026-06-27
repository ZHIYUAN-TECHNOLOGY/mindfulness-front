import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { requestMagicLink, verifyMagicLink } from "../lib/auth";
import { useAuth } from "./__root";

export const Route = createFileRoute("/admin/login")({
  component: LoginComponent,
  head: () => ({ meta: [{ title: "Workshop · Sign in" }] }),
});

function LoginComponent() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestMagicLink(email);
      setSent(true);
    } catch {
      setError("Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await verifyMagicLink(token);
      setUser(user);
      navigate({ to: "/admin/settings" });
    } catch {
      setError("Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] grid place-items-center px-6 py-20 bg-paper">
      <div className="w-full max-w-[460px]">
        <Link to="/" className="label-meta hover:text-ink transition inline-flex items-center gap-2 mb-10">
          ← Back to the site
        </Link>
        <span className="eyebrow">Workshop</span>
        <h1 className="display display-l mt-5">
          A small <span className="italic-accent">door.</span>
        </h1>
        <p className="lead mt-6">
          {sent
            ? "Check your email for the sign-in token. Paste it below."
            : "Enter your administrator email. A one-time sign-in token will arrive within a minute."}
        </p>

        <div className="mt-12">
          {error && (
            <p className="mb-5 text-[13px]" style={{ color: "var(--rust)" }}>
              {error}
            </p>
          )}

          {!sent ? (
            <form onSubmit={handleRequest}>
              <div className="field-ed">
                <label htmlFor="admin-email">Administrator email</label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="charles@mindfulnesstochange.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-ed btn-primary w-full justify-center mt-3.5 disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send magic link"}{" "}
                <span className="btn-arrow">→</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <div className="field-ed">
                <label htmlFor="admin-token">Sign-in token</label>
                <input
                  id="admin-token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  placeholder="Paste the token from the email"
                  style={{ fontFamily: "var(--mono)", letterSpacing: "0.05em" }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-ed btn-primary w-full justify-center mt-3.5 disabled:opacity-60"
              >
                {loading ? "Verifying…" : "Verify and enter"}{" "}
                <span className="btn-arrow">→</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setToken("");
                }}
                className="btn-link mt-6"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
