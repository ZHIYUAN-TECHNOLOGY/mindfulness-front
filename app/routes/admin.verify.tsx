import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { verifyMagicLink } from "../lib/auth";
import { useAuth } from "./__root";

export const Route = createFileRoute("/admin/verify")({
  component: VerifyComponent,
  head: () => ({ meta: [{ title: "Workshop · Verifying" }] }),
});

function VerifyComponent() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const token = search.get("token");
    if (!token) {
      setError("Missing token in URL.");
      return;
    }
    verifyMagicLink(token)
      .then((user) => {
        setUser(user);
        navigate({ to: "/admin/settings" });
      })
      .catch(() => setError("Invalid or expired token."));
  }, [navigate, setUser]);

  return (
    <main className="min-h-[100dvh] grid place-items-center px-6 py-20 bg-paper">
      <div className="w-full max-w-[460px] text-center">
        <span className="eyebrow-bare">{error ? "Verification failed" : "Verifying"}</span>
        <h1 className="display display-l mt-6">
          {error ? (
            <>An <span className="italic-accent">expired</span> token.</>
          ) : (
            <>One <span className="italic-accent">moment.</span></>
          )}
        </h1>
        {error ? (
          <>
            <p className="lead mt-6 mx-auto">{error}</p>
            <Link to="/admin/login" className="btn-link mt-8 inline-flex">
              Request a new link <span className="btn-arrow">→</span>
            </Link>
          </>
        ) : (
          <p className="lead mt-6 mx-auto">Opening the workshop.</p>
        )}
      </div>
    </main>
  );
}
