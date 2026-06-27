import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { ScrollReveal } from "../components/ScrollReveal";
import { FooterSection } from "../components/sections/FooterSection";
import { EventCountdown } from "../components/EventCountdown";
import { normalizeMediaUrl } from "../lib/media";
import { stripHtml } from "../lib/html";

export const Route = createFileRoute("/events")({
  component: EventsRoute,
  head: () => ({
    meta: [
      { title: "Retreats & Lectures · Dr. Charles Lee" },
      {
        name: "description",
        content:
          "In-person retreats, lectures, and conversations — held by Dr. Charles Lee around the world.",
      },
    ],
  }),
});

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  location: string | null;
  imageUrl: string | null;
  status: string;
  isActive: boolean;
  series?: string | null;
  createdAt: string;
}

function formatEventMeta(event: EventItem): string {
  const date = new Date(event.eventDate);
  const dateStr = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `${dateStr}${event.location ? ` · ${event.location}` : ""}`;
}

// `/events/$id` and `/events/cancel/$token` are child routes of this `/events`
// route. When the path is a child, render the child via <Outlet/> instead of
// the events list.
function EventsRoute() {
  const { pathname } = useLocation();
  if (pathname !== "/events" && pathname !== "/events/") {
    return <Outlet />;
  }
  return <EventsPage />;
}

function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/events")
      .then((data) => setEvents(data.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    apiFetch("/api/settings").then(setSettings).catch(() => {});
  }, []);

  const upcoming = useMemo(
    () => events.filter((e) => e.status === "upcoming" && e.isActive),
    [events]
  );
  const past = useMemo(
    () => events.filter((e) => e.status === "past" && e.isActive),
    [events]
  );

  const eventsHeading =
    (settings["events.heading"] as string) ||
    "In a <span class='italic-accent'>room,</span><br>together.";
  const eventsBody =
    (settings["events.body"] as string) ||
    "A small number of in-person retreats and lectures each year. Seats open here first, and on the Sunday letter.";

  const navLinks =
    (settings["nav.links"] as Array<{ label: string; href: string }>) || [];
  const socialLinks =
    (settings["footer.social_links"] as Array<{ platform: string; url: string }>) || [];

  const retreatCount = upcoming.filter((e) =>
    /retreat/i.test(e.title + (e.description ?? ""))
  ).length;
  const lectureCount = upcoming.filter((e) =>
    /lecture|talk|conversation/i.test(e.title + (e.description ?? ""))
  ).length;
  const onlineCount = upcoming.filter((e) =>
    /online|virtual|stream/i.test((e.location ?? "") + e.title + (e.description ?? ""))
  ).length;

  const yearRange = useMemo(() => {
    if (upcoming.length === 0) return null;
    const years = Array.from(
      new Set(upcoming.map((e) => new Date(e.eventDate).getFullYear()))
    ).sort();
    return years.length === 1 ? `${years[0]}` : `${years[0]} — ${years[years.length - 1]}`;
  }, [upcoming]);

  return (
    <main>
      {/* HERO */}
      <section
        className="relative overflow-hidden pb-[60px]"
        style={{
          minHeight: "70dvh",
          paddingTop: "clamp(100px, 16vw, 180px)",
        }}
      >
        <div className="container-editorial">
          <div className="grid items-start gap-10 md:[grid-template-columns:minmax(0,1fr)_minmax(0,0.7fr)]">
            <div>
              <span className="eyebrow reveal in">
                Retreats · Lectures{yearRange ? ` · ${yearRange}` : ""}
              </span>
              <h1
                className="display mt-7 reveal in delay-1"
                style={{ fontSize: "clamp(32px, 4.5vw, 56px)" }}
                dangerouslySetInnerHTML={{ __html: eventsHeading }}
              />
              <p className="lead mt-8 reveal in delay-2">
                {eventsBody}
              </p>
            </div>
            {upcoming.length > 0 && (
              <div
                className="reveal in delay-2"
                style={{
                  background: "var(--paper-soft)",
                  padding: 32,
                  borderRadius: 4,
                }}
              >
                <span className="eyebrow">In the room, this year</span>
                <ul
                  className="mt-5"
                  style={{ listStyle: "none", padding: 0, fontFamily: "var(--mono)", fontSize: 14 }}
                >
                  {(
                    [
                      ["Upcoming events", upcoming.length],
                      ["Retreats", retreatCount],
                      ["Public lectures", lectureCount],
                      ["Online", onlineCount],
                    ] as Array<[string, number]>
                  )
                    .filter(([, n]) => n > 0)
                    .map(([label, num], idx, arr) => (
                      <li
                        key={label}
                        className="flex justify-between"
                        style={{
                          padding: "12px 0",
                          borderTop: "1px solid var(--line)",
                          borderBottom:
                            idx === arr.length - 1 ? "1px solid var(--line)" : "none",
                        }}
                      >
                        <span>{label}</span>
                        <span className="numeric text-ink text-[16px]">
                          {String(num).padStart(2, "0")}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* UPCOMING */}
      <section className="section-y">
        <div className="container-editorial">
          <ScrollReveal animation="scroll-reveal-up">
            <div className="mb-14">
              <span className="eyebrow mb-5 inline-flex">
                VIRTUAL EVENT
              </span>
              <h2 className="display mt-2" style={{ fontSize: "clamp(40px, 5.5vw, 72px)" }}>
                The <span className="italic-accent">calendar.</span>
              </h2>
            </div>
          </ScrollReveal>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-12">
              {[0, 1].map((i) => (
                <div key={i}>
                  <div
                    className="aspect-[16/10] mb-6"
                    style={{ background: "var(--paper-soft)" }}
                  />
                  <div className="h-3 w-1/3" style={{ background: "var(--paper-deep)" }} />
                  <div className="h-7 mt-3" style={{ background: "var(--paper-deep)" }} />
                  <div className="h-3 mt-4 w-2/3" style={{ background: "var(--paper-deep)" }} />
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
              <div className="text-center py-20">
                <p className="display display-s">No upcoming events, just now.</p>
                <p className="body-prose mt-4 mx-auto">
                  Charles announces the next year's calendar each November. The Sunday letter is
                  the first place to hear.
                </p>
                <a href="/subscribe" className="btn-link mt-7 inline-flex">
                  Subscribe to the letter <span className="btn-arrow">→</span>
                </a>
              </div>
            </ScrollReveal>
          ) : (
            <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
              <div className="grid md:grid-cols-2 gap-12">
                {upcoming.map((event) => {
                  const isVirtual = /online|virtual|stream/i.test(
                    (event.location ?? "") + event.title + (event.description ?? "")
                  );
                  return (
                  <Link
                    key={event.id}
                    to="/events/$id"
                    params={{ id: event.id }}
                    className="block group"
                  >
                    {event.imageUrl && (
                      <div className="photo-warm photo-wide mb-6 relative">
                        <img src={normalizeMediaUrl(event.imageUrl)} alt={event.title} />
                        {isVirtual && (
                          <span className="absolute top-4 left-4 bg-[var(--gold-primary)] text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded shadow">
                            VIRTUAL EVENT
                          </span>
                        )}
                      </div>
                    )}
                    <span className="label-meta">{formatEventMeta(event)}</span>
                    <h3 className="display display-m mt-3">{event.title}</h3>
                    {event.description && (
                      <p className="body-prose mt-3.5" style={{ fontSize: 17 }}>
                        {stripHtml(event.description)}
                      </p>
                    )}
                    <EventCountdown
                      targetDate={event.eventDate}
                      size="compact"
                      hideSeconds
                      className="mt-6"
                    />
                  </Link>
                );
              })}
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      <div className="section-divider" />

      {/* PAST EVENTS — grouped by series */}
      {past.length > 0 && (
        <section className="section-y">
          <div className="container-editorial">
            {(() => {
              const pastApcomm = past.filter(
                (e) =>
                  e.series === "apcomm" ||
                  (!e.series && /apcomm/i.test(e.title))
              );
              const pastApcod = past.filter(
                (e) =>
                  e.series === "apcod" ||
                  (!e.series && /apcod/i.test(e.title))
              );
              const pastOther = past.filter(
                (e) =>
                  !pastApcomm.some((a) => a.id === e.id) &&
                  !pastApcod.some((a) => a.id === e.id)
              );
              return (
                <>
                  {/* APCOMM — MINDFULNESS record */}
                  {pastApcomm.length > 0 && (
                    <>
                      <ScrollReveal animation="scroll-reveal-up">
                        <div className="section-header">
                          <div className="left">
                            <span className="eyebrow mb-5 inline-flex">
                              Past events · {pastApcomm.length}
                            </span>
                            <h2 className="display mt-2" style={{ fontSize: "clamp(40px, 5.5vw, 72px)" }}>
                              A MINDFULNESS <span className="italic-accent">record.</span>
                            </h2>
                          </div>
                          <div className="right">
                            <p className="body-prose">
                              {pastApcomm.length === 1
                                ? "One past event, on record."
                                : `${pastApcomm.length} past events, on record.`}
                            </p>
                          </div>
                        </div>
                      </ScrollReveal>

                      <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
                        <div className="grid md:grid-cols-2 gap-8">
                          {pastApcomm.map((event) => {
                            const year = new Date(event.eventDate).getFullYear();
                            return (
                              <div
                                key={event.id}
                                className="group block rounded-lg border border-gold-light/10 bg-brown-dark/20 p-6 hover:bg-brown-dark/40 hover:border-gold-light/25 transition"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <span className="num">{year}</span>
                                  <span className="label-meta">LECTURE</span>
                                </div>
                                <h3 className="display display-s mt-5 group-hover:text-gold-primary transition">
                                  {event.title}
                                </h3>
                                <p className="meta mt-3">
                                  {new Date(event.eventDate).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                  })}
                                  {event.location ? ` · ${event.location}` : ""}
                                </p>
                                {event.description && (
                                  <p className="body-prose mt-4 line-clamp-2">{stripHtml(event.description)}</p>
                                )}
                                <div className="mt-6">
                                  <Link
                                    to="/events/$id"
                                    params={{ id: event.id }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-[var(--gold-primary)] text-white text-sm font-semibold tracking-wider uppercase hover:bg-[var(--gold-light)] transition"
                                  >
                                    Link to {event.title} Webpage
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M7 17L17 7" />
                                      <path d="M7 7h10v10" />
                                    </svg>
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollReveal>
                    </>
                  )}

                  {/* APCOD — DISCIPLESHIP record */}
                  {pastApcod.length > 0 && (
                    <>
                      <div className="section-divider" />
                      <ScrollReveal animation="scroll-reveal-up">
                        <div className="section-header">
                          <div className="left">
                            <span className="eyebrow mb-5 inline-flex">
                              Past events · {pastApcod.length}
                            </span>
                            <h2 className="display mt-2" style={{ fontSize: "clamp(40px, 5.5vw, 72px)" }}>
                              A DISCIPLESHIP <span className="italic-accent">record.</span>
                            </h2>
                          </div>
                          <div className="right">
                            <p className="body-prose">
                              {pastApcod.length === 1
                                ? "One past event, on record."
                                : `${pastApcod.length} past events, on record.`}
                            </p>
                          </div>
                        </div>
                      </ScrollReveal>

                      <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
                        <div className="grid md:grid-cols-2 gap-8">
                          {pastApcod.map((event) => {
                            const year = new Date(event.eventDate).getFullYear();
                            return (
                              <Link
                                key={event.id}
                                to="/events/$id"
                                params={{ id: event.id }}
                                className="group block rounded-lg border border-gold-light/10 bg-brown-dark/20 p-6 hover:bg-brown-dark/40 hover:border-gold-light/25 transition"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <span className="num">{year}</span>
                                  <span className="label-meta">LECTURES / WORKSHOPS</span>
                                </div>
                                <h3 className="display display-s mt-5 group-hover:text-gold-primary transition">
                                  {event.title}
                                </h3>
                                <p className="meta mt-3">
                                  {new Date(event.eventDate).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                  })}
                                  {event.location ? ` · ${event.location}` : ""}
                                </p>
                                {event.description && (
                                  <p className="body-prose mt-4 line-clamp-2">{stripHtml(event.description)}</p>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </ScrollReveal>
                    </>
                  )}

                  {/* Other past events (fallback) */}
                  {pastOther.length > 0 && (
                    <>
                      <div className="section-divider" />
                      <ScrollReveal animation="scroll-reveal-up">
                        <div className="section-header">
                          <div className="left">
                            <span className="eyebrow mb-5 inline-flex">
                              Past events · {pastOther.length}
                            </span>
                            <h2 className="display mt-2" style={{ fontSize: "clamp(40px, 5.5vw, 72px)" }}>
                              A <span className="italic-accent">record.</span>
                            </h2>
                          </div>
                          <div className="right">
                            <p className="body-prose">
                              {pastOther.length === 1
                                ? "One past event, on record."
                                : `${pastOther.length} past events, on record.`}
                            </p>
                          </div>
                        </div>
                      </ScrollReveal>

                      <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
                        <div className="grid md:grid-cols-2 gap-8">
                          {pastOther.map((event) => {
                            const year = new Date(event.eventDate).getFullYear();
                            const isRetreat = /retreat/i.test(event.title);
                            return (
                              <Link
                                key={event.id}
                                to="/events/$id"
                                params={{ id: event.id }}
                                className="group block rounded-lg border border-gold-light/10 bg-brown-dark/20 p-6 hover:bg-brown-dark/40 hover:border-gold-light/25 transition"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <span className="num">{year}</span>
                                  <span className="label-meta">{isRetreat ? "Retreat" : "Lecture"}</span>
                                </div>
                                <h3 className="display display-s mt-5 group-hover:text-gold-primary transition">
                                  {event.title}
                                </h3>
                                <p className="meta mt-3">
                                  {new Date(event.eventDate).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                  })}
                                  {event.location ? ` · ${event.location}` : ""}
                                </p>
                                {event.description && (
                                  <p className="body-prose mt-4 line-clamp-2">{stripHtml(event.description)}</p>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </ScrollReveal>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </section>
      )}

      {/* BOOKING / SPEAKING INQUIRIES */}
      <section className="section-y bg-ink text-paper">
        <div className="container-editorial">
          <div className="grid md:grid-cols-2 gap-[60px] items-center">
            <div>
              <span className="eyebrow-bare" style={{ color: "var(--honey-light)" }}>
                Speaking inquiries
              </span>
              <h2
                className="display display-l mt-4"
                style={{ color: "var(--paper)" }}
              >
                Have{" "}
                <span className="italic-accent" style={{ color: "var(--honey-light)" }}>
                  Charles speak.
                </span>
              </h2>
              <p className="lead mt-6" style={{ color: "rgba(244,239,228,0.78)" }}>
                Universities, hospitals, foundations, parishes, and reading communities. Charles
                accepts five to seven outside engagements each year.
              </p>
            </div>
            <div
              style={{
                background: "rgba(244,239,228,0.06)",
                padding: 36,
                borderRadius: 4,
                border: "1px solid rgba(244,239,228,0.15)",
              }}
            >
              <span className="label-meta" style={{ color: "var(--honey-light)" }}>
                Send a letter
              </span>
              <a
                href="mailto:charles@mindfulnesstochange.com"
                className="block font-serif text-[28px] mt-3.5"
                style={{ color: "var(--paper)" }}
              >
                charles@mindfulnesstochange.com
              </a>
              <p
                className="mt-3"
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: 15,
                  color: "rgba(244,239,228,0.7)",
                }}
              >
                Replies in approximately 14 days. Please include date window, location, audience,
                and the question you would most like Charles to address.
              </p>
            </div>
          </div>
        </div>
      </section>

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
