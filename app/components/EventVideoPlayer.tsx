import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { normalizeMediaUrl } from "../lib/media";
import { getYouTubeEmbedUrl } from "../lib/youtube";

interface VideoDetail {
  id: string;
  title: string;
  provider: "youtube" | "r2";
  videoUrl: string;
  thumbnailUrl?: string;
}

interface Props {
  eventId: string;
  videoId: string;
}

function friendlyError(message: string): string {
  if (message.includes("Membership required")) {
    return "This recording is for members only. Get a 30-day pass to watch.";
  }
  if (message.includes("Unauthorized")) {
    return "Please sign in to watch this recording.";
  }
  if (message.includes("Not found")) {
    return "This recording could not be found.";
  }
  return "Unable to load this recording. Please try again.";
}

export function EventVideoPlayer({ eventId, videoId }: Props) {
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setVideo(null);
    setError("");
    apiFetch(`/api/events/${eventId}/videos/${videoId}`, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setVideo(data.video);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Failed to load video");
      });
    return () => controller.abort();
  }, [eventId, videoId]);

  if (error) {
    return (
      <div className="event-video-player__notice event-video-player__notice--error">
        <p className="text-sm">{friendlyError(error)}</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="event-video-player__notice">
        <p className="text-sm text-gold-pale">Loading video…</p>
      </div>
    );
  }

  const embedUrl = video.provider === "youtube" ? getYouTubeEmbedUrl(video.videoUrl) : null;

  if (video.provider === "youtube" && !embedUrl) {
    return (
      <div className="event-video-player__notice event-video-player__notice--error">
        <p className="text-sm">Unable to load this YouTube video. The URL may be unsupported.</p>
      </div>
    );
  }

  return (
    <div className="event-video-player">
      <div className="event-video-player__frame">
        {video.provider === "youtube" ? (
          <iframe
            src={embedUrl!}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <video
            controls
            src={normalizeMediaUrl(video.videoUrl)}
            className="w-full h-full"
            poster={video.thumbnailUrl || undefined}
          />
        )}
      </div>

      <div className="event-video-player__caption">
        <span className="eyebrow-bare">Now playing</span>
        <h4 className="display display-s event-video-player__title mt-2">{video.title}</h4>
      </div>
    </div>
  );
}
