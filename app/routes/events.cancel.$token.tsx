import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/events/cancel/$token")({
  component: CancelRegistrationPage,
});

function CancelRegistrationPage() {
  const { token } = Route.useParams();
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleCancel = async () => {
    setState("working");
    try {
      const data = await apiFetch(`/api/events/registrations/cancel/${token}`, {
        method: "POST",
      });
      setMessage(
        data.eventTitle
          ? `Your registration for "${data.eventTitle}" has been cancelled.`
          : "Your registration has been cancelled."
      );
      setState("done");
    } catch (err: any) {
      setMessage(err.message || "Could not cancel this registration.");
      setState("error");
    }
  };

  return (
    <main
      className="container-prose"
      style={{ paddingTop: "clamp(120px, 18vw, 200px)", paddingBottom: 80 }}
    >
      <span className="eyebrow">Event registration</span>
      <h1 className="display display-l mt-3">Cancel registration</h1>

      {state === "done" || state === "error" ? (
        <p className="body-prose mt-6">{message}</p>
      ) : (
        <>
          <p className="body-prose mt-6">
            Cancelling will release your seat(s) for this event. This cannot be undone.
          </p>
          <button
            onClick={handleCancel}
            disabled={state === "working"}
            className="btn-ed btn-primary mt-8"
          >
            {state === "working" ? "Cancelling…" : "Cancel my registration"}
          </button>
        </>
      )}

      <div className="mt-10">
        <Link to="/events" className="btn-link inline-flex">
          Back to events <span className="btn-arrow">→</span>
        </Link>
      </div>
    </main>
  );
}
