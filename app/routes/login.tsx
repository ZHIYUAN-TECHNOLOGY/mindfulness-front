import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { login } from "../lib/auth";
import { useAuth } from "./__root";
import { AuthSplit } from "../components/AuthSplit";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
  head: () => ({
    meta: [{ title: "Sign in · Dr. Charles Lee" }],
  }),
});

function LoginComponent() {
  const { setUser } = useAuth();
  const navigate = Route.useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNeedsVerify(false);
    setLoading(true);
    try {
      const user = await login(email, password);
      setUser(user);
      navigate({ to: "/" });
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("verify")) {
        setNeedsVerify(true);
        setError("Please verify your email before logging in.");
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <AuthSplit
        eyebrow="Sign in"
        title={<>Welcome <span className="italic-accent">back.</span></>}
        intro="Your bookmarks, members chapters, and the long Sunday letter are waiting in your dashboard."
        footer={
          <>
            New here?{" "}
            <Link
              to="/register"
              style={{
                color: "var(--ink)",
                borderBottom: "1px solid currentColor",
              }}
            >
              Create an account
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
            <span className="help text-right block">
              <Link
                to="/forgot-password"
                style={{ borderBottom: "1px solid currentColor" }}
              >
                Forgot password?
              </Link>
            </span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-ed btn-primary w-full justify-center mt-3.5 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"} <span className="btn-arrow">→</span>
          </button>

          {needsVerify && (
            <button
              type="button"
              onClick={() => navigate({ to: "/verify-otp", search: { email } })}
              className="btn-link mt-5 mx-auto"
            >
              Verify email <span className="btn-arrow">→</span>
            </button>
          )}
        </form>
      </AuthSplit>
    </main>
  );
}
