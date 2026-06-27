import { useEffect } from "react";
import { resolveMediaUrl } from "../lib/media";

/** Extract an 11-char YouTube video id from any common YouTube URL form. */
function youTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

/**
 * Centered popup video player. Plays YouTube videos in an embedded iframe
 * (or a direct video file) without leaving the site. The player appears as a
 * large centered card over a blurred backdrop instead of full-screen.
 * Close with the ✕ button, the backdrop, or Escape.
 */
export function VideoPopup({
  url,
  onClose,
}: {
  url: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!url) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [url, onClose]);

  if (!url) return null;

  const ytId = youTubeId(url);

  return (
    <div
      className="video-popup"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
    >
      <button
        type="button"
        className="video-popup__close"
        onClick={onClose}
        aria-label="Close video"
      >
        ✕
      </button>
      <div
        className="video-popup__frame"
        onClick={(e) => e.stopPropagation()}
      >
        {ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
            title="Video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={resolveMediaUrl(url)} controls autoPlay preload="metadata" />
        )}
      </div>
    </div>
  );
}
