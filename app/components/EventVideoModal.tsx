import { useEffect } from "react";
import { EventVideoPlayer } from "./EventVideoPlayer";

interface Props {
  open: boolean;
  eventId: string;
  videoId: string | null;
  onClose: () => void;
}

export function EventVideoModal({ open, eventId, videoId, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
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

  if (!open || !videoId) return null;

  return (
    <div
      className="event-video-modal"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
    >
      <button
        type="button"
        className="event-video-modal__close"
        onClick={onClose}
        aria-label="Close video"
      >
        ✕
      </button>
      <div className="event-video-modal__content" onClick={(e) => e.stopPropagation()}>
        <EventVideoPlayer eventId={eventId} videoId={videoId} />
      </div>
    </div>
  );
}
