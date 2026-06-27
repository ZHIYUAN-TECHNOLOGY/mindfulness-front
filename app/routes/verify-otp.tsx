import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { verifyOtp, resendOtp } from "../lib/auth";
import { useAuth } from "./__root";
import { AuthSplit } from "../components/AuthSplit";

export const Route = createFileRoute("/verify-otp")({
  component: VerifyOtpComponent,
  head: () => ({
    meta: [{ title: "Verify your email · Dr. Charles Lee" }],
  }),
});

function VerifyOtpComponent() {
  const { setUser } = useAuth();
  const navigate = Route.useNavigate();
  const search = Route.useSearch() as { email?: string };
  const [email, setEmail] = useState(
    search.email || (typeof window !== "undefined" ? localStorage.getItem("verifyEmail") || "" : "")
  );
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!email && search.email) {
      setEmail(search.email);
      localStorage.setItem("verifyEmail", search.email);
    }
  }, [search.email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await verifyOtp(email, otp);
      localStorage.removeItem("verifyEmail");
      setUser(user);
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setResent(false);
    setError("");
    setResending(true);
    try {
      await resendOtp(email);
      setResent(true);
    } catch (err: any) {
      setError(err?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main>
      <AuthSplit
        eyebrow="Verify your email"
        title={<>A small <span className="italic-accent">code.</span></>}
        intro={
          <>
            Enter the six-digit code sent to{" "}
            <strong style={{ color: "var(--ink)" }}>{email || "your inbox"}</strong>. It expires
            in ten minutes.
          </>
        }
        quoteLabel="A small confirmation"
        quote="The slowest gates open with the smallest keys."
        quoteAttribution="— from chapter six"
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
            <p className="mb-5 text-[13px]" style={{ color: "var(--rust)" }}>
              {error}
            </p>
          )}
          {resent && (
            <p className="mb-5 text-[13px]" style={{ color: "var(--honey-deep)" }}>
              A new code has been sent.
            </p>
          )}
          <div className="field-ed">
            <label htmlFor="otp">Verification code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              placeholder="000000"
              className="text-center"
              style={{
                fontFamily: "var(--mono)",
                fontSize: 28,
                letterSpacing: "0.4em",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-ed btn-primary w-full justify-center mt-3.5 disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify"} <span className="btn-arrow">→</span>
          </button>

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={onResend}
              disabled={resending}
              className="btn-link text-[13px] disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          </div>
        </form>
      </AuthSplit>
    </main>
  );
}
