import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  imageUrl?: string;
  quote?: string;
  quoteAttribution?: string;
  quoteLabel?: string;
  footer?: ReactNode;
}

export function AuthSplit({
  eyebrow,
  title,
  intro,
  children,
  imageUrl,
  quote = "The reading does not begin when you sit down. It begins when you decide to sit down.",
  quoteAttribution = "— from chapter three",
  quoteLabel = "A welcome back",
  footer,
}: Props) {
  const hasImage = Boolean(imageUrl);
  return (
    <section
      className="grid md:[grid-template-columns:minmax(0,1.05fr)_minmax(0,0.95fr)]"
      style={{ minHeight: "100dvh" }}
    >
      {/* LEFT: image + quote — hidden on mobile to keep form focus */}
      <div
        className="photo-warm relative hidden md:block"
        style={{
          minHeight: "100dvh",
          background: hasImage ? undefined : "var(--ink)",
        }}
      >
        {hasImage && (
          <img
            src={imageUrl}
            alt="A quiet portrait"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              inset: 0,
            }}
          />
        )}
        {hasImage && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(24,20,16,0.05) 0%, rgba(24,20,16,0.5) 100%)",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 60,
            right: 60,
            color: "var(--paper)",
          }}
        >
          <span className="eyebrow" style={{ color: "var(--honey-light)" }}>
            {quoteLabel}
          </span>
          <p
            className="pull-quote mt-6"
            style={{ color: "var(--paper)" }}
          >
            {quote}
          </p>
          <p
            className="label-meta mt-3.5"
            style={{ color: "rgba(244,239,228,0.7)" }}
          >
            {quoteAttribution}
          </p>
        </div>
      </div>

      {/* RIGHT: form */}
      <div
        className="flex flex-col justify-center"
        style={{
          padding: "clamp(80px, 14vw, 160px) var(--pad-x) clamp(48px, 8vw, 80px)",
        }}
      >
        <div className="mx-auto w-full" style={{ maxWidth: 420 }}>
          <span className="eyebrow reveal in">{eyebrow}</span>
          <h1 className="display display-m mt-3.5 reveal in delay-1">{title}</h1>
          {intro && (
            <p
              className="body-prose reveal in delay-2 mt-4"
              style={{ fontSize: 15 }}
            >
              {intro}
            </p>
          )}

          <div className="reveal in delay-3 mt-10">{children}</div>

          {footer && (
            <p
              className="mt-10 text-center text-[14px]"
              style={{ color: "var(--ink-mute)" }}
            >
              {footer}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
