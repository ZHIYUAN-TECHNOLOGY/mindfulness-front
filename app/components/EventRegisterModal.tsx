import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export function EventRegisterModal({
  open,
  onClose,
  eventId,
  eventTitle,
  defaultEmail = "",
}: {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  defaultEmail?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(defaultEmail);
      setName("");
      setPhone("");
      setMessage("");
      setError("");
      setDone(false);
      setSubmitting(false);
    }
  }, [open, defaultEmail]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      await apiFetch(`/api/events/${eventId}/register`, {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });

      setDone(true);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="event-register-modal" onClick={onClose} role="dialog" aria-modal="true">
      <div className="event-register-modal__content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="event-register-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {done ? (
          <div className="event-register-modal__body">
            <span className="eyebrow-bare">Thank you for signing up!</span>
            <h2 className="display display-s mt-5">You're registered.</h2>
            <p className="lead mt-4">
              You will receive an email shortly and updates on our 2nd virtual Asia Pacific consultation on marketplace mindfulness, APCOMM 2027.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-ed btn-primary w-full justify-center mt-7"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="event-register-modal__body">
            <h2 className="display display-s">APCOMM 2027</h2>
            <p className="lead mt-4">
              Enter your email below to reserve your EARLY BIRD SEAT and receive a FREE COPY of "WATCH"!
            </p>

            <form onSubmit={handleSubmit} className="event-register-modal__form">
              <div className="field">
                <label htmlFor="erm-name">Full name *</label>
                <input
                  id="erm-name"
                  className="ev-input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="field">
                <label htmlFor="erm-email">Email *</label>
                <input
                  id="erm-email"
                  className="ev-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="field">
                <label htmlFor="erm-phone">Phone (optional)</label>
                <input
                  id="erm-phone"
                  className="ev-input"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="field">
                <label htmlFor="erm-message">Message (optional)</label>
                <textarea
                  id="erm-message"
                  className="ev-input"
                  rows={3}
                  placeholder="Anything else we should know?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={submitting}
                />
              </div>
              {error && <p className="event-register-modal__error">{error}</p>}
              <button
                type="submit"
                className="btn-ed btn-primary w-full justify-center"
                disabled={submitting}
              >
                {submitting ? "Registering…" : "Register my seat"}
                <span className="btn-arrow">→</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
