import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/unsubscribe")({
  component: UnsubscribePage,
  head: () => ({
    meta: [{ title: "Unsubscribe · Dr. Charles Lee" }],
  }),
});

function UnsubscribePage() {
  const search = Route.useSearch() as { token?: string };
  const token = search.token;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    apiFetch("/api/newsletter/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <main className="pt-[180px] pb-[120px] min-h-[100dvh]">
      <div className="container-prose text-center">
        {status === "loading" && (
          <>
            <span className="eyebrow-bare">Processing</span>
            <h1 className="display display-l mt-6">A small <span className="italic-accent">pause.</span></h1>
            <p className="lead mt-6 mx-auto">Updating your preferences.</p>
          </>
        )}
        {status === "success" && (
          <>
            <span className="eyebrow-bare">Unsubscribed</span>
            <h1 className="display display-l mt-6">
              The letter has <span className="italic-accent">stopped.</span>
            </h1>
            <p className="lead mt-6 mx-auto">
              You will no longer receive the Sunday letter. You can return at any time — the door is
              never locked.
            </p>
            <Link to="/" className="btn-link mt-8 inline-flex">
              Return home <span className="btn-arrow">→</span>
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <span className="eyebrow-bare">Something went wrong</span>
            <h1 className="display display-l mt-6">
              An <span className="italic-accent">expired</span> link.
            </h1>
            <p className="lead mt-6 mx-auto">
              We could not process your request. The link may be invalid or expired. Please write
              to <a href="mailto:charles@mindfulnesstochange.com" style={{ borderBottom: "1px solid currentColor" }}>charles@mindfulnesstochange.com</a> and we will unsubscribe you by hand.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
