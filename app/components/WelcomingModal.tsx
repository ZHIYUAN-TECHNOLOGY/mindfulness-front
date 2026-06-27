import { useEffect, useState } from "react";
import { resolveMediaUrl } from "../lib/media";

function youTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

export function WelcomingModal({
  open,
  onClose,
  videoUrl,
  coverUrl,
  eyebrow,
  title,
  body,
  quote,
}: {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
  coverUrl: string;
  eyebrow: string;
  title: string;
  body: string;
  quote?: string;
}) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!open) {
      setPlaying(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const ytId = youTubeId(videoUrl);

  return (
    <div
      className="welcoming-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
    >
      <div
        className="welcoming-modal__content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="welcoming-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="welcoming-modal__grid">
          <div className="welcoming-modal__media">
            {playing ? (
              <div className="welcoming-modal__player">
                {ytId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                    title="Video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={resolveMediaUrl(videoUrl)} controls autoPlay preload="metadata" />
                )}
              </div>
            ) : (
              <button
                type="button"
                className="welcoming-video"
                onClick={() => setPlaying(true)}
                aria-label={title ? `Play ${title}` : "Play welcome video"}
              >
                {coverUrl ? (
                  <img src={coverUrl} alt="" loading="lazy" />
                ) : (
                  <span className="welcoming-video__ph" />
                )}
                <span className="welcoming-video__play" aria-hidden="true">
                  <svg width="24" height="28" viewBox="0 0 14 16">
                    <path d="M0 0v16l14-8L0 0z" fill="currentColor" />
                  </svg>
                </span>
              </button>
            )}
          </div>

          <div className="welcoming-modal__text">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && (
              <h2
                className="display mt-5"
                style={{ fontSize: "clamp(32px, 4vw, 56px)" }}
              >
                {title}
              </h2>
            )}
            {body && (
              <p className="lead mt-6" style={{ whiteSpace: "pre-wrap" }}>
                {body}
              </p>
            )}
            {quote && (
              <p className="lead mt-4" style={{ whiteSpace: "pre-wrap" }}>
                <em style={{ fontStyle: "italic" }}>{quote}</em>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
