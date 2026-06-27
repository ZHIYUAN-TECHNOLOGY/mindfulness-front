import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { ScrollReveal } from "../components/ScrollReveal";
import { FooterSection } from "../components/sections/FooterSection";
import { PortraitImage } from "../components/PortraitImage";
import { normalizeMediaUrl } from "../lib/media";

export const Route = createFileRoute("/memoir")({
  component: MemoirPage,
  head: () => ({
    meta: [
      { title: "From Death Into Life — Memoir · Dr. Charles Lee" },
      {
        name: "description",
        content: "A memoir in seven parts, written over seven years.",
      },
    ],
  }),
});

interface Praise {
  quote: string;
  attribution: string;
}

const PRAISE: Praise[] = [
  {
    quote: '"The first book in a decade that I have read aloud to my wife, on purpose, in the evening."',
    attribution: "— Dr. Adaeze Okonkwo · The Yale Review",
  },
  {
    quote: '"A book that does the difficult thing of being slow without being precious."',
    attribution: "— Sumitra Acharya · The Atlantic",
  },
  {
    quote: '"I have given seven copies away. I will give more."',
    attribution: "— Father Tomasz Wieczorek · Plough Quarterly",
  },
];

function PreBookForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const bodyParts = [];
    if (phone) bodyParts.push(`Phone: ${phone}`);
    if (message) bodyParts.push(message);
    const bodyText = bodyParts.length ? bodyParts.join("\n\n") : "Pre-book request for I SEE YOU memoir.";

    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          subject: "Pre-book: I SEE YOU",
          message: bodyText,
        }),
      });
      setStatus("success");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div
        className="reveal in delay-2"
        style={{ background: "var(--paper-soft)", padding: 44, borderRadius: 2, alignSelf: "start" }}
      >
        <span className="eyebrow">Reserved</span>
        <h3 className="display display-s mt-4">Thank you.</h3>
        <p className="body-prose mt-5">
          We have received your pre-book request. You will hear back soon with next steps.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="btn-link mt-7"
        >
          Reserve another copy <span className="btn-arrow">→</span>
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="reveal in delay-2"
      style={{ background: "var(--paper-soft)", padding: 44, borderRadius: 2, alignSelf: "start" }}
    >
      <span className="eyebrow">Pre-book</span>
      <h3 className="display display-s mt-3.5 mb-8">Reserve your copy.</h3>

      <div className="field-ed">
        <label htmlFor="prebook-name">Full name *</label>
        <input
          id="prebook-name"
          type="text"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div className="field-ed">
        <label htmlFor="prebook-email">Email *</label>
        <input
          id="prebook-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="field-ed">
        <label htmlFor="prebook-phone">Phone (optional)</label>
        <input
          id="prebook-phone"
          type="tel"
          maxLength={30}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
        />
      </div>

      <div className="field-ed">
        <label htmlFor="prebook-message">Message (optional)</label>
        <textarea
          id="prebook-message"
          maxLength={500}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Anything else we should know?"
        />
      </div>

      {status === "error" && (
        <p className="text-[var(--rust)] text-[13px] mb-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-ed btn-primary w-full justify-center mt-5"
      >
        {status === "loading" ? "Reserving…" : "Reserve my copy"}
      </button>
    </form>
  );
}

function MemoirPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});

  useEffect(() => {
    apiFetch("/api/settings").then(setSettings).catch(() => {});
  }, []);

  const navLinks =
    (settings["nav.links"] as Array<{ label: string; href: string }>) || [];
  const socialLinks =
    (settings["footer.social_links"] as Array<{ platform: string; url: string }>) || [];

  const heroCover = normalizeMediaUrl(
    (settings["books.cover_url"] as string) ||
      (settings["memoir.banner_url"] as string)
  );
  const heroEyebrow =
    (settings["memoir.hero_label"] as string) ||
    "A memoir · 312 pages · spring 2026";
  const memoirHeroTitle =
    (settings["memoir.hero_title"] as string) || "I See You";
  const memoirHeroSubtitle =
    (settings["memoir.hero_subtitle"] as string) || "From Death Into Life";

  return (
    <main>
      {/* HERO */}
      <section
        className="relative overflow-hidden pb-[60px] min-h-[100dvh]"
        style={{ paddingTop: "clamp(100px, 16vw, 160px)" }}
      >
        <div className="container-editorial">
          <div className="grid items-center gap-10 md:[grid-template-columns:minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div>
              <span className="eyebrow reveal in">{heroEyebrow}</span>
              <h1
                className="display mt-7 reveal in delay-1"
                style={{ fontSize: "clamp(40px, 6vw, 88px)" }}
              >
                {memoirHeroTitle}
                {memoirHeroSubtitle && (
                  <>
                    <br />
                    <span
                      className="italic-accent"
                      style={{ fontSize: "0.55em" }}
                    >
                      {memoirHeroSubtitle}
                    </span>
                  </>
                )}
              </h1>
              <p className="lead mt-8 reveal in delay-2">
                In I SEE YOU: ‘You cannot change what you do not know’, Charles shares his struggle
                to change as a result of past emotional scars that prevented him from experiencing a
                life of spiritual fulfilment and joy. Faced with the possibility of encountering death
                in 2011 from open heart bypass surgery, a spiritual “sign” was the turning point from
                total exasperation and fear to a redemptive awareness in a loving God.
              </p>
            </div>

            <div className="flex justify-center reveal in delay-1">
              <div
                className="photo-warm photo-book"
                style={{
                  maxWidth: 420,
                  boxShadow: "0 60px 100px -50px rgba(24,20,16,0.6)",
                  transform: "rotate(-2deg)",
                }}
              >
                <PortraitImage
                  src={heroCover}
                  alt="From Death to Life book cover"
                  fallbackInitials="FDtL"
                  noFallbackImage
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT THE BOOK + PRE-BOOK FORM */}
      <section className="section-y" style={{ background: "var(--paper-soft)" }}>
        <div className="container-editorial">
          <div className="grid items-start gap-10 md:[grid-template-columns:minmax(0,1fr)_minmax(0,0.85fr)]">
            <div>
              <ScrollReveal animation="scroll-reveal-up">
                <span className="eyebrow">About the book</span>
              </ScrollReveal>
              <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
                <h2 className="display display-m mt-4">
                  A book for the people who are not yet ready for a solution.
                </h2>
              </ScrollReveal>
              <ScrollReveal animation="scroll-reveal-up" delay="delay-2">
                <div className="body-prose mt-9">
                  <p>
                    Written over seven years, I SEE YOU traces the turning point of a surgeon who faced
                    his own mortality. It is not a how-to. It is a record of a return — from emotional
                    scars and spiritual emptiness to a redemptive awareness found only in the presence of
                    God.
                  </p>
                  <p>
                    It is for anyone who has tried to change and found themselves stuck. For the reader
                    who senses there is more to life than fulfilment through achievement. For the person
                    who longs to know they are seen — and loved — exactly as they are.
                  </p>
                  <p>You will not be told what to do. You will, I hope, recognize yourself.</p>
                </div>
              </ScrollReveal>
            </div>

            <PreBookForm />
          </div>
        </div>
      </section>

      {/* PRAISE */}
      <section className="section-y bg-ink text-paper">
        <div className="container-editorial">
          <ScrollReveal animation="scroll-reveal-up">
            <span className="eyebrow-bare" style={{ color: "var(--honey-light)" }}>
              Early readers
            </span>
          </ScrollReveal>
          <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
              {PRAISE.map((p) => (
                <div key={p.attribution}>
                  <p
                    className="display display-s"
                    style={{ color: "var(--paper)", lineHeight: 1.3 }}
                  >
                    {p.quote}
                  </p>
                  <p
                    className="label-meta mt-6"
                    style={{ color: "var(--honey-light)" }}
                  >
                    {p.attribution}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
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
