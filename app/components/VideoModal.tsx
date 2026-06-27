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
 * Full-screen popup video player. Plays YouTube videos in an embedded iframe
 * (or a direct video file) without leaving the site. Close with the ✕ button,
 * the backdrop, or Escape.
 */
export function VideoModal({
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
      className="video-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
    >
      <button
        type="button"
        className="video-modal__close"
        onClick={onClose}
        aria-label="Close video"
      >
        ✕
      </button>
      <div className="video-modal__frame" onClick={(e) => e.stopPropagation()}>
        {ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
            title="Video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={resolveMediaUrl(url)} controls autoPlay />
        )}
      </div>
    </div>
  );
}
