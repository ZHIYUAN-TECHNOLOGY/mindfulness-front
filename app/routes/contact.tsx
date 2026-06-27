import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { FooterSection } from "../components/sections/FooterSection";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact · Dr. Charles Lee" },
      {
        name: "description",
        content:
          "A quiet way to get in touch with Dr. Charles Lee — for press, speaking, and reader letters.",
      },
    ],
  }),
});

const TOPICS = [
  "This is About",
  "An Inquiry to Charles",
  "APCOMM inquiry",
  "Membership help",
  "Speaking or Retreat",
  "Other Matters",
];

function ContactPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/settings").then(setSettings).catch(() => {});
  }, []);

  const navLinks =
    (settings["nav.links"] as Array<{ label: string; href: string }>) || [];
  const socialLinks =
    (settings["footer.social_links"] as Array<{ platform: string; url: string }>) ||
    [];


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await apiFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });
      setStatus("success");
      setName("");
      setEmail("");
      setSubject(TOPICS[0]);
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <main>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "auto", padding: "clamp(100px, 16vw, 180px) 0 60px" }}
      >
        <div className="container-editorial">
          <div className="grid items-start gap-10 md:[grid-template-columns:minmax(0,1fr)_minmax(0,0.85fr)]">
            <div>
              <span className="eyebrow reveal in">Contact</span>
              <h1 className="display display-l mt-6 reveal in delay-1">
                A Message from{" "}
                <span style={{ color: "var(--honey-deep)" }}>Charles.</span>
              </h1>
              <div className="mt-7 reveal in delay-2 space-y-4"
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "clamp(16px, 1.8vw, 22px)",
                  lineHeight: 1.5,
                  color: "var(--ink-soft)",
                  maxWidth: "54ch",
                }}
              >
                <p>
                  Welcome to <em>Mindfulness to Change</em>. I founded this space to create an opportunity
                  of hope in the marketplace to bridge the challenge to be a better person using life
                  transforming principles against the distraction of the world we live in.
                </p>
                <p>
                  If you are interested in developing a spiritual awareness of how to live an abundant life
                  through faith, then I encourage you to join me at the 2<sup>nd</sup> Virtual Marketplace
                  Consultation APCOMM 2027 and rediscover how ancient practices of spirituality can transform you.
                </p>
                <p>Your vision matters here. Reach out below, and let’s discuss how we can WALK the TALK together.</p>
              </div>

              <div className="mt-10 space-y-3 reveal in delay-2">
                <p className="flex items-start gap-2">
                  <span className="text-gold-primary mt-0.5">◆</span>
                  <span>
                    Write to:{" "}
                    <a
                      href="mailto:charles@mindfulnesstochange.com"
                      className="underline underline-offset-4 hover:text-gold-primary transition"
                    >
                      charles@mindfulnesstochange.com
                    </a>
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-gold-primary mt-0.5">◆</span>
                  <span>
                    Mindful Matters regarding APCOMM 2027:{" "}
                    <a
                      href="mailto:charles@mindfulnesstochange.com"
                      className="underline underline-offset-4 hover:text-gold-primary transition"
                    >
                      charles@mindfulnesstochange.com
                    </a>
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-gold-primary mt-0.5">◆</span>
                  <span>Whatsapp: +601882425224</span>
                </p>
              </div>

              <div className="mt-10 reveal in delay-2">
                <img
                  src={(settings["contact.signature_url"] as string) || ""}
                  alt="Charles Lee signature"
                  className="opacity-80"
                  style={{
                    width: (settings["contact.signature_width"] as number) || 220,
                    height: "auto",
                    marginLeft: (settings["contact.signature_x"] as number) || 0,
                    marginTop: (settings["contact.signature_y"] as number) || 0,
                  }}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            </div>

            {/* FORM */}
            {status === "success" ? (
              <div
                className="reveal in delay-2"
                style={{
                  background: "var(--paper-soft)",
                  padding: 44,
                  borderRadius: 2,
                  alignSelf: "start",
                }}
              >
                <span className="eyebrow">Sent</span>
                <h3 className="display display-s mt-4">A reply, in time.</h3>
                <p className="body-prose mt-5">
                  Thank you. Charles reads in batches — mornings, Wednesdays. You will hear back
                  when the inbox allows.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="btn-link mt-7"
                >
                  Write another <span className="btn-arrow">→</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="reveal in delay-2"
                style={{ background: "var(--paper-soft)", padding: 44, borderRadius: 2 }}
              >
                <span className="eyebrow">Or use the form</span>
                <h3 className="display display-s mt-3.5 mb-8">A short letter.</h3>

                <div className="field-ed">
                  <label htmlFor="name">Your Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ines Aaltonen"
                    style={{ fontFamily: "var(--sans)" }}
                  />
                </div>
                <div className="field-ed">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ines.aaltonen@helsinki.fi"
                    style={{ fontFamily: "var(--sans)" }}
                  />
                </div>
                <div className="field-ed">
                  <label htmlFor="topic">Subject</label>
                  <select
                    id="topic"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{ fontFamily: "var(--sans)" }}
                  >
                    {TOPICS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="field-ed">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    required
                    maxLength={5000}
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write as long as you would like. Most readers find it helps to write slowly."
                    style={{ fontFamily: "var(--sans)" }}
                  />
                  <span className="help">
                    No need to be brief — Charles prefers letters that say what they mean.
                  </span>
                </div>

                {status === "error" && (
                  <p className="text-[var(--rust)] text-[13px] mb-3 mt-3">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-ed btn-primary w-full justify-center mt-5"
                >
                  {status === "loading" ? "Sending…" : "Send letter"}{" "}
                  <span className="btn-arrow">→</span>
                </button>
                <p
                  className="mt-4 text-center"
                  style={{ fontSize: 12, color: "var(--ink-mute)" }}
                >
                  By writing, you agree to the{" "}
                  <a href="/terms" style={{ borderBottom: "1px solid currentColor" }}>
                    letter policy
                  </a>
                  .
                </p>
              </form>
            )}
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
