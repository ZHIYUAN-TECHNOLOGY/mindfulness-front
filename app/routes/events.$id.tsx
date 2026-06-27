import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { FooterSection } from "../components/sections/FooterSection";
import { EventCountdown } from "../components/EventCountdown";
import { EventVideoList, type EventVideo } from "../components/EventVideoList";
import { EventVideoModal } from "../components/EventVideoModal";
import { MembershipGateModal } from "../components/MembershipGateModal";
import { BlockRenderer, type Block } from "../components/BlockRenderer";
import { normalizeMediaUrl } from "../lib/media";
import { ScrollReveal } from "../components/ScrollReveal";

export const Route = createFileRoute("/events/$id")({
  component: EventDetailPage,
});

interface EventPricing {
  amount: number;
  currency: string;
  label: string;
  isEarlyBird: boolean;
  earlyBirdUntil: string | null;
  totalDisplay: string;
  regularPriceDisplay: string;
  earlyBirdPriceDisplay: string | null;
}

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  location: string | null;
  imageUrl: string | null;
  headerImageUrl: string | null;
  recordingLibraryImageUrl: string | null;
  status: string;
  paymentMode: "free" | "self_collect" | "online";
  price: number | null;
  regularPrice: number | null;
  earlyBirdPrice: number | null;
  earlyBirdMode: "disabled" | "days_before_event" | "fixed_date";
  earlyBirdDaysBefore: number;
  earlyBirdUntil: string | null;
  stripeProductId: string | null;
  currency: string;
  capacity: number | null;
  registrationOpen: boolean;
  blocks: Block[];
}

function formatWhen(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function formatDateParts(dateStr: string) {
  const d = new Date(dateStr);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
    month: d.toLocaleDateString("en-US", { month: "short" }),
    day: d.getDate(),
    year: d.getFullYear(),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
}

function EventDetailPage() {
  const { id } = Route.useParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [seatsLeft, setSeatsLeft] = useState<number | null>(null);
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pricing, setPricing] = useState<EventPricing | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [videos, setVideos] = useState<EventVideo[]>([]);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    apiFetch(`/api/events/${id}`)
      .then((data) => {
        setEvent(data.event);
        setSeatsLeft(data.seatsLeft);
        setPricing(data.pricing);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
    apiFetch("/api/settings").then(setSettings).catch(() => {});
    apiFetch(`/api/events/${id}/videos`)
      .then((data) => {
        setVideos(data.videos || []);
      })
      .catch(() => {});
  }, [id]);

  const navLinks =
    (settings["nav.links"] as Array<{ label: string; href: string }>) || [];
  const socialLinks =
    (settings["footer.social_links"] as Array<{ platform: string; url: string }>) || [];

  const isPast =
    !!event && (event.status === "past" || new Date(event.eventDate) < new Date());
  const isFull = seatsLeft != null && seatsLeft <= 0;
  const canRegister =
    !!event &&
    !isPast &&
    event.registrationOpen &&
    !isFull &&
    event.paymentMode !== "online";

  const canPayOnline =
    !!event &&
    !isPast &&
    event.registrationOpen &&
    !isFull &&
    event.paymentMode === "online";

  const priceText =
    pricing
      ? pricing.totalDisplay
      : event && event.price != null
      ? `${event.currency} ${(event.price / 100).toFixed(2)}`
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await apiFetch(`/api/events/${id}/register`, {
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
      setError(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOnlineCheckout = async () => {
    setCheckoutLoading(true);
    setError("");
    try {
      const data = await apiFetch(`/api/events/${id}/create-checkout-session`, {
        method: "POST",
      });
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Checkout failed.");
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="container-editorial" style={{ paddingTop: 160 }}>
        <p className="body-prose">Loading…</p>
      </main>
    );
  }

  if (notFound || !event) {
    return (
      <main className="container-editorial" style={{ paddingTop: 160 }}>
        <p className="display display-s">Event not found.</p>
        <Link to="/events" className="btn-link mt-6 inline-flex">
          Back to events <span className="btn-arrow">→</span>
        </Link>
      </main>
    );
  }

  const dateParts = formatDateParts(event.eventDate);
  const hasHeader = !!event.headerImageUrl;

  return (
    <main className="event-detail-page">
      {hasHeader && (
        <div className="event-detail-banner">
          <img src={normalizeMediaUrl(event.headerImageUrl)} alt={event.title} />
        </div>
      )}

      <section
        className="container-editorial event-detail-hero"
        style={{
          paddingTop: hasHeader ? "4.5rem" : "clamp(120px, 16vw, 170px)",
        }}
      >
        <Link to="/events" className="event-detail-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          All events
        </Link>

        <div className="grid items-start gap-10 lg:gap-[clamp(40px,6vw,96px)] mt-8 lg:grid-cols-[1fr_minmax(340px,420px)]">
          <div className="event-detail-main">
            <div className="event-detail-meta">
              <div className="event-detail-datebox">
                <span className="event-detail-datebox__month">{dateParts.month}</span>
                <span className="event-detail-datebox__day">{dateParts.day}</span>
                <span className="event-detail-datebox__year">{dateParts.year}</span>
              </div>

              <div className="event-detail-info">
                <span className="label-meta">{dateParts.weekday}</span>
                <span className="event-detail-time">{dateParts.time}</span>
                {event.location ? (
                  <span className="event-detail-location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {event.location}
                  </span>
                ) : null}
              </div>
            </div>

            <h1 className="display display-l mt-6 event-detail-title">{event.title}</h1>

            {event.description && (
              <div
                className="event-detail-description body-prose"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            )}

            {!isPast && event.registrationOpen && (
              <EventCountdown
                targetDate={event.eventDate}
                size="compact"
                hideSeconds
                className="mt-8"
              />
            )}
          </div>

          <div className="lg:sticky lg:top-28">
            <div className="event-register-card">
              <span className="eyebrow">{isPast ? "Event passed" : "Register"}</span>
              <h2 className="display display-s mt-3">{isPast ? "Join the APCOMM Library." : "Reserve your seat."}</h2>
              {priceText && (
                <p className="body-prose mt-3">
                  {event.paymentMode === "self_collect"
                    ? `${priceText} per seat — paid directly to the organiser.`
                    : event.paymentMode === "online"
                    ? `${priceText} per seat — secure online payment.`
                    : `${priceText} per seat.`}
                  {pricing?.isEarlyBird && pricing.earlyBirdUntil && (
                    <span className="block text-gold-light/80 text-sm mt-1">
                      Early-bird price ends{" "}
                      <strong>{new Date(pricing.earlyBirdUntil).toLocaleDateString()}</strong>
                    </span>
                  )}
                </p>
              )}
              {seatsLeft != null && !isPast && (
                <p className={`label-meta mt-2 inline-flex ${isFull ? "text-rust" : ""}`}>
                  {seatsLeft > 0
                    ? `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left`
                    : "Fully booked"}
                </p>
              )}

              {done ? (
                <div className="mt-7">
                  <p className="display display-s">You're registered.</p>
                  <p className="body-prose mt-3">
                    A confirmation email is on its way to {email}. It includes a
                    link to cancel if your plans change.
                  </p>
                </div>
              ) : canPayOnline ? (
                <div className="mt-6 space-y-4">
                  <button
                    onClick={handleOnlineCheckout}
                    disabled={checkoutLoading}
                    className="btn-ed btn-primary w-full justify-center"
                  >
                    {checkoutLoading ? "Opening checkout…" : `Pay ${priceText} per seat`}
                    <span className="btn-arrow">→</span>
                  </button>
                  <p className="text-sm text-gold-light/70">
                    Secure checkout via Stripe. You will be redirected back after payment.
                  </p>
                </div>
              ) : !canRegister ? (
                isPast ? (
                  <div className="mt-6">
                    <p className="body-prose">
                      This event has passed. Members can watch the recordings below.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <p className="body-prose">
                      {isFull
                        ? "This event is fully booked."
                        : "Registration for this event is closed."}
                    </p>
                    <Link to="/events" className="btn-link inline-flex">
                      View other events <span className="btn-arrow">→</span>
                    </Link>
                  </div>
                )
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reg-name" className="label-meta">Full name *</label>
                    <input
                      id="reg-name"
                      className="ev-input"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reg-email" className="label-meta">Email *</label>
                    <input
                      id="reg-email"
                      className="ev-input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reg-phone" className="label-meta">Phone (optional)</label>
                    <input
                      id="reg-phone"
                      className="ev-input"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reg-message" className="label-meta">Message (optional)</label>
                    <textarea
                      id="reg-message"
                      className="ev-input"
                      rows={3}
                      placeholder="Anything else we should know?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-ed btn-primary w-full justify-center mt-2"
                  >
                    {submitting ? "Registering…" : "Register"}
                    <span className="btn-arrow">→</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {event.blocks?.length > 0 && (
        <section className="section-y section-dark event-detail-blocks">
          <div className={event.recordingLibraryImageUrl ? "container-editorial !max-w-none" : "container-editorial"}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {event.recordingLibraryImageUrl && (
                <div className="md:col-span-4">
                  <img
                    src={normalizeMediaUrl(event.recordingLibraryImageUrl)}
                    alt={`${event.title} recording library`}
                    className="w-full h-auto object-cover rounded-sm"
                  />
                </div>
              )}
              <div className={event.recordingLibraryImageUrl ? "md:col-span-8" : "md:col-span-12"}>
                <BlockRenderer blocks={event.blocks} />
              </div>
            </div>
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section className="section-y section-dark event-videos-section">
          <div className="container-editorial">
            <span className="eyebrow">Members-only recordings</span>
            <h2 className="display display-m mt-5">Continue the conversation.</h2>
            <p className="body-prose mt-5 max-w-2xl">
              Select a recording to watch. Members-only videos open with a 30-day pass.
            </p>

            <EventVideoList
              videos={videos}
              activeId={playingVideoId}
              onSelect={(videoId) => {
                const video = videos.find((v) => v.id === videoId);
                if (video?.locked) {
                  setGateOpen(true);
                  return;
                }
                setPlayingVideoId(videoId);
              }}
            />
          </div>
        </section>
      )}

      <EventVideoModal
        open={!!playingVideoId}
        eventId={event.id}
        videoId={playingVideoId}
        onClose={() => setPlayingVideoId(null)}
      />
      <MembershipGateModal open={gateOpen} onClose={() => setGateOpen(false)} />

      {/* H.E.B.R.A.I.C. ZONES — copied from About page */}
      <section className="section-y" style={{ background: "var(--paper-soft)" }}>
        <div className="container-editorial">
          <ScrollReveal animation="scroll-reveal-up">
            <div className="section-header">
              <div className="left">
                <span className="eyebrow mb-5 inline-flex">
                  {(settings["about_page.zones_eyebrow"] as string) || "A framework, in seven"}
                </span>
                <h2 className="display mt-2" style={{ fontSize: "clamp(40px, 5.5vw, 72px)" }}>
                  {(settings["about_page.zones_heading_line1"] as string) || "THE"}
                  <br />
                  {(settings["about_page.zones_heading_line2"] as string) || "H.E.B.R.A.I.C."}
                  <span className="italic-accent">
                    {" "}
                    {(settings["about_page.zones_heading_accent"] as string) || "zones."}
                  </span>
                </h2>
              </div>
              <div className="right">
                <p className="body-prose">
                  {(settings["about_page.zones_description"] as string) ||
                    "Each zone is a small practice that goes beyond modern \"mindfulness\". It is deeply biblical, covenantal, relational and creates a consciousness that is rooted in the Hebrew Scriptures."}
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
            <div
              className="grid grid-cols-1 md:grid-cols-2"
              style={{ gap: 1, background: "var(--line)" }}
            >
              {getZones(settings).map((zone, i) => (
                <div
                  key={zone.code}
                  className={i === 6 ? "md:col-span-2" : ""}
                  style={{ background: "var(--paper-soft)", padding: 36 }}
                >
                  <span
                    className="numeric"
                    style={{ color: "var(--honey-deep)", fontSize: 14 }}
                  >
                    {zone.code}
                  </span>
                  <h3 className="display display-s mt-2.5">{zone.title}</h3>
                  <p className="body-prose mt-3" style={{ fontSize: 17 }}>
                    {zone.body}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-divider" />

      <FooterSection
        copyright={
          (settings["footer.copyright"] as string) ||
          "Copyright © 2026"
        }
        poweredBy={
          (settings["footer.powered_by"] as string) ||
          "Powered by ZYT"
        }
        contactUrl={(settings["footer.contact_url"] as string) || "/contact"}
        socialLinks={socialLinks}
        navLinks={navLinks}
        brandName={(settings["footer.brand"] as string) || "Charles Lee"}
        tagline={
          (settings["footer.tagline"] as string) ||
          "Founder of the Asia Pacific Consultation On Marketplace Mindfulness, APCOMM."
        }
      />
    </main>
  );
}

interface Zone {
  code: string;
  title: string;
  body: string;
}

const DEFAULT_ZONES: Zone[] = [
  { code: "01 · H", title: "HINENI", body: "\"Here I am\". A response to a divine call that is hardest of the seven. An expression of absolute surrender, deep humility and trust to listen and readiness to serve." },
  { code: "02 · E", title: "ETHICAL", body: "A consciousness in Hebrew thought that refers to discipline and active shaping of one's inner character and response to a higher moral authority." },
  { code: "03 · B", title: "BIBLICAL", body: "A reverent attentiveness to all scripture which is God-breathed and rooted in the Hebrew bible for learning, teaching in righteousness for every good work." },
  { code: "04 · R", title: "RELATIONAL", body: "In Hebrew thought relates to being \"set apart\" in relationship to God as Lord of all life." },
  { code: "05 · A", title: "AWARENESS", body: "In the present moment. In the 'Here & Now' that God is eternally present in time." },
  { code: "06 · I", title: "INHABIT", body: "How to inhabit time? Finding hope in the future by reconciling with the past and trusting God's redemptive presence in the here and now." },
  { code: "07 · C", title: "COVENANT", body: "The foundation of the Hebrew scriptures is the covenantal relationship and bond between God and humanity. The core essence of covenant is expressed in the phrase: \"I will be your God, and you will be My people.\"" },
];

function getZones(src: Record<string, unknown>): Zone[] {
  const val = src["about_page.zones"];
  if (Array.isArray(val) && val.length > 0) return val as Zone[];
  return DEFAULT_ZONES;
}
