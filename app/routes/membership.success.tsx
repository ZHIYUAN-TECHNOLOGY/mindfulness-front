import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/membership/success")({
  component: MembershipSuccessPage,
});

function MembershipSuccessPage() {
  const [verifying, setVerifying] = useState(true);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setVerifying(false);
      return;
    }
    apiFetch(`/api/membership/status?session_id=${sessionId}`)
      .then((data) => {
        if (data.expiresAt) setExpiresAt(data.expiresAt);
      })
      .catch(() => {})
      .finally(() => setVerifying(false));
  }, []);

  return (
    <main className="container-editorial" style={{ paddingTop: "clamp(120px, 16vw, 180px)" }}>
      <span className="eyebrow">Thank you</span>
      <h1 className="display display-l mt-6">
        Your pass is <span className="italic-accent">active.</span>
      </h1>

      <p className="lead mt-6">
        {verifying
          ? "Confirming your payment…"
          : expiresAt
          ? `Your 30-day membership is active until ${new Date(expiresAt).toLocaleDateString()}.`
          : "Your 30-day membership is active."}
      </p>

      <div className="flex flex-wrap gap-4 mt-10">
        <Link to="/events" className="btn-ed btn-primary inline-flex">
          Browse events <span className="btn-arrow">→</span>
        </Link>
        <Link to="/dashboard" className="btn-ed inline-flex">
          Go to dashboard <span className="btn-arrow">→</span>
        </Link>
      </div>
    </main>
  );
}
