import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { register } from "../lib/auth";
import { AuthSplit } from "../components/AuthSplit";

export const Route = createFileRoute("/register")({
  component: RegisterComponent,
  head: () => ({
    meta: [{ title: "Create an account · Dr. Charles Lee" }],
  }),
});

function RegisterComponent() {
  const navigate = Route.useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const result = await register(email, password);
      localStorage.setItem("verifyEmail", result.email);
      navigate({ to: "/verify-otp", search: { email: result.email } });
    } catch (err: any) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <AuthSplit
        eyebrow="Create an account"
        title={<>Begin, <span className="italic-accent">slowly.</span></>}
        intro="An account holds your bookmarks, your reading progress, and — for members — the chapters that open only with a key."
        quoteLabel="A small beginning"
        quote="You will not be asked to do much. Only to begin, and to keep beginning."
        quoteAttribution="— from chapter one"
        footer={
          <>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "var(--ink)",
                borderBottom: "1px solid currentColor",
              }}
            >
              Sign in
            </Link>
          </>
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
          <div className="field-ed">
            <label htmlFor="password">Password</label>
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
            {loading ? "Creating account…" : "Create account"}{" "}
            <span className="btn-arrow">→</span>
          </button>
        </form>
      </AuthSplit>
    </main>
  );
}
