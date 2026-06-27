import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/events/$id/success")({
  component: EventTicketSuccessPage,
});

function EventTicketSuccessPage() {
  const { id } = Route.useParams();
  const [verifying, setVerifying] = useState(true);
  const [eventTitle, setEventTitle] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    Promise.all([
      apiFetch(`/api/events/${id}`)
        .then((data) => setEventTitle(data.event?.title || null))
        .catch(() => {}),
      sessionId
        ? apiFetch(`/api/stripe/session-status?session_id=${sessionId}`).catch(() => null)
        : Promise.resolve(null),
    ]).finally(() => setVerifying(false));
  }, [id]);

  return (
    <main className="container-editorial" style={{ paddingTop: "clamp(120px, 16vw, 180px)" }}>
      <span className="eyebrow">Thank you</span>
      <h1 className="display display-l mt-6">
        Your ticket is <span className="italic-accent">confirmed.</span>
      </h1>

      <p className="lead mt-6">
        {verifying
          ? "Confirming your payment…"
          : eventTitle
          ? `You are registered for ${eventTitle}. A confirmation email is on its way.`
          : "You are registered for this event. A confirmation email is on its way."}
      </p>

      <div className="flex flex-wrap gap-4 mt-10">
        <Link to="/events" className="btn-ed btn-primary inline-flex">
          Browse more events <span className="btn-arrow">→</span>
        </Link>
        <Link to="/dashboard" className="btn-ed inline-flex">
          Go to dashboard <span className="btn-arrow">→</span>
        </Link>
      </div>
    </main>
  );
}
