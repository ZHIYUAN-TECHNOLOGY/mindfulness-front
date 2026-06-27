import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { resetPassword } from "../lib/auth";
import { useAuth } from "./__root";
import { AuthSplit } from "../components/AuthSplit";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordComponent,
  head: () => ({
    meta: [{ title: "Set a new password · Dr. Charles Lee" }],
  }),
});

function ResetPasswordComponent() {
  const { setUser } = useAuth();
  const navigate = Route.useNavigate();
  const search = Route.useSearch() as { token?: string };
  const [token, setToken] = useState(search.token || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.token) setToken(search.token);
  }, [search.token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const user = await resetPassword(token, password);
      setUser(user);
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main>
        <AuthSplit
          eyebrow="Expired"
          title={<>An <span className="italic-accent">expired</span> link.</>}
          intro="This password reset link is invalid or has already been used. You can request a fresh one — it takes a minute."
          quoteLabel="Begin again"
          quote="Most of the practice is, simply, beginning again."
          quoteAttribution="— from chapter four"
          footer={
            <Link
              to="/forgot-password"
              style={{
                color: "var(--ink)",
                borderBottom: "1px solid currentColor",
              }}
            >
              Request a new link
            </Link>
          }
        >
          <Link
            to="/forgot-password"
            className="btn-ed btn-primary w-full justify-center"
          >
            Request a fresh link <span className="btn-arrow">→</span>
          </Link>
        </AuthSplit>
      </main>
    );
  }

  return (
    <main>
      <AuthSplit
        eyebrow="Set new password"
        title={<>A new <span className="italic-accent">key.</span></>}
        intro="Choose a password you will remember without strain. Minimum eight characters."
        quoteLabel="A clean page"
        quote="Begin where you are, with the day you have, with the words you can find."
        quoteAttribution="— from chapter two"
        footer={
          <Link
            to="/login"
            style={{
              color: "var(--ink)",
              borderBottom: "1px solid currentColor",
            }}
          >
            Back to sign in
          </Link>
        }
      >
        <form onSubmit={onSubmit}>
          {error && (
            <p
              className="mb-5 text-[13px]"
              style={{ color: "var(--rust)" }}
            >
              {error}
            </p>
          )}
          <div className="field-ed">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
            />
            <span className="help">Minimum 8 characters.</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-ed btn-primary w-full justify-center mt-3.5 disabled:opacity-60"
          >
            {loading ? "Saving…" : "Reset password"}{" "}
            <span className="btn-arrow">→</span>
          </button>
        </form>
      </AuthSplit>
    </main>
  );
}
