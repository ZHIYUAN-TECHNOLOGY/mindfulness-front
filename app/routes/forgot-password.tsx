import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { forgotPassword } from "../lib/auth";
import { AuthSplit } from "../components/AuthSplit";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordComponent,
  head: () => ({
    meta: [{ title: "Reset password · Dr. Charles Lee" }],
  }),
});

function ForgotPasswordComponent() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
    } catch {
      // intentional: avoid email enumeration
    }
    setSent(true);
    setLoading(false);
  }

  return (
    <main>
      <AuthSplit
        eyebrow={sent ? "On its way" : "Reset password"}
        title={
          sent ? (
            <>Check your <span className="italic-accent">inbox.</span></>
          ) : (
            <>A small <span className="italic-accent">reset.</span></>
          )
        }
        intro={
          sent
            ? "If an account with that email exists, a reset link is on its way. Please check spam, too — letters wander."
            : "Enter the email you used to register. A reset link will arrive within a few minutes."
        }
        quoteLabel="A small resumption"
        quote="The slow return begins each time you sit, again, with the same patient attention."
        quoteAttribution="— from chapter five"
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
        {sent ? (
          <div>
            <p className="body-prose" style={{ fontSize: 17 }}>
              Once it arrives, click the link in the email to set a new password. The link
              expires in one hour.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="field-ed">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ines.aaltonen@helsinki.fi"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-ed btn-primary w-full justify-center mt-3.5 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}{" "}
              <span className="btn-arrow">→</span>
            </button>
          </form>
        )}
      </AuthSplit>
    </main>
  );
}
