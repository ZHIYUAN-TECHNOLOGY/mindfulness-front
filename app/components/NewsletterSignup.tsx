import { useState, type FormEvent } from "react";
import { apiFetch } from "../lib/api";

interface Props {
  imageUrl?: string;
  squareImageUrl?: string;
  eyebrow?: string;
  heading?: string;
  italicAccent?: string;
  body?: string;
  footnote?: string;
}

export function NewsletterSignup({
  imageUrl,
  squareImageUrl,
  eyebrow = "Newsletter",
  heading = "The Mindful Christian Newsletter",
  italicAccent = "",
  body = "Join our APCOMM community for monthly reflections, event updates and media resources on <em>‘Biblical Mindfulness’</em>.",
  footnote = "",
}: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      await apiFetch("/api/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined }),
      });
      setStatus("success");
      setEmail("");
      setName("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="newsletter" className="section-y bg-ink text-paper">
      <div className="container-editorial">
        <div className="grid items-center gap-10 lg:gap-16 md:grid-cols-2">
          {imageUrl ? (
            <div className="photo-warm aspect-[4/3] relative">
              <img
                src={imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div aria-hidden="true" />
          )}

          <div className={imageUrl ? "" : "md:col-span-2 text-center"}>
            {(eyebrow || squareImageUrl) && (
              <div className="inline-flex items-end gap-0.5 md:gap-1 mb-6 md:mb-8">
                {eyebrow && (
                  <span className="eyebrow-bare newsletter-eyebrow" style={{ color: "var(--honey-light)" }}>
                    {eyebrow}
                  </span>
                )}
                {squareImageUrl && (
                  <div className="shrink-0 w-8 h-8 md:w-12 md:h-12 -ml-0.5 relative"
                  >
                    <img
                      src={squareImageUrl}
                      alt=""
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            )}
            <h2
              className="display display-l"
              style={{ color: "var(--paper)", fontSize: "clamp(40px, 6vw, 84px)" }}
            >
              {heading}{" "}
              <span className="italic-accent" style={{ color: "var(--honey-light)" }}>
                {italicAccent}
              </span>
              .
            </h2>
            <p
              className="lead mx-auto mt-7"
              style={{
                color: "rgba(244,239,228,0.78)",
                maxWidth: imageUrl ? "none" : "640px",
              }}
            >
              <span dangerouslySetInnerHTML={{ __html: body }} />
            </p>

            <form
              onSubmit={submit}
              className={`mt-10 mx-auto flex flex-wrap gap-3 justify-center ${
                imageUrl ? "max-w-[560px]" : "max-w-[560px]"
              }`}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.org"
                className="flex-1 min-w-[240px] bg-transparent border border-paper/30 px-6 py-3.5 rounded-full text-paper placeholder:text-paper/40 font-serif text-base focus:outline-none focus:border-honey-light transition"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First name (optional)"
                className="flex-1 min-w-[200px] bg-transparent border border-paper/30 px-6 py-3.5 rounded-full text-paper placeholder:text-paper/40 font-serif text-base focus:outline-none focus:border-honey-light transition"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-ed bg-paper text-ink hover:bg-honey-light disabled:opacity-60"
              >
                {status === "loading" ? "Subscribing…" : "Subscribe"}{" "}
                <span className="btn-arrow">→</span>
              </button>
            </form>

            <div
              className="mt-6 min-h-[20px] text-[12px]"
              style={{ color: "rgba(244,239,228,0.5)" }}
            >
              {status === "success" && <span>Thanks — your first letter is on its way.</span>}
              {status === "error" && (
                <span style={{ color: "var(--rust)" }}>Something went wrong. Please try again.</span>
              )}
              {status === "idle" && footnote && <span>{footnote}</span>}
              {status === "loading" && <span>One moment…</span>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
