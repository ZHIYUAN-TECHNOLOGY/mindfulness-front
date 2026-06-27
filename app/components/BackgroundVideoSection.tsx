import { useEffect, useMemo, useRef } from "react";
import { normalizeMediaUrl, resolveMediaUrl } from "../lib/media";

interface Props {
  videoUrl: string;
  /** Optional poster shown until the video plays. */
  posterUrl?: string;
  /** Optional overlay text that floats over the video. */
  eyebrow?: string;
  title?: string;
  italicAccent?: string;
  /** 0–1 tint applied between the video and the foreground text. */
  overlayOpacity?: number;
}

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

function youTubeEmbedSrc(url: string): string | null {
  const idMatch = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  const id = idMatch?.[1];
  if (!id) return null;
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: id,
    controls: "0",
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

/**
 * Editorial background-video band. Lives between full sections of the page.
 * - Auto-plays on intersection, pauses on exit (saves CPU + respects context).
 * - Muted + playsinline so iOS Safari allows autoplay.
 * - Honours prefers-reduced-motion: stays paused, shows poster.
 */
export function BackgroundVideoSection({
  videoUrl,
  posterUrl,
  eyebrow,
  title,
  italicAccent,
  overlayOpacity = 0.42,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const resolvedVideoUrl = useMemo(() => resolveMediaUrl(videoUrl), [videoUrl]);
  const resolvedPosterUrl = useMemo(
    () => resolveMediaUrl(posterUrl) || undefined,
    [posterUrl]
  );

  const isYouTube = isYouTubeUrl(resolvedVideoUrl);
  const embedSrc = isYouTube ? youTubeEmbedSrc(resolvedVideoUrl) : null;

  useEffect(() => {
    if (isYouTube) return; // YouTube iframe handles its own playback
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let inView = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          inView = entry.isIntersecting && entry.intersectionRatio > 0.25;
          if (inView) {
            // play() returns a promise that can reject (autoplay policy);
            // swallow it — there's no recovery action to take.
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    observer.observe(section);

    // Pause when the tab loses focus to save battery.
    const onVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else if (inView) {
        video.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      video.pause();
    };
  }, [resolvedVideoUrl, isYouTube]);

  if (!resolvedVideoUrl) return null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(520px, 82vh, 900px)" }}
    >
      {/* Media layer */}
      {isYouTube && embedSrc ? (
        <iframe
          src={embedSrc}
          title="Background video"
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            border: 0,
            // Scale up so the YouTube branding bar at the bottom is cropped out.
            // Combined with `pointer-events-none` to keep it purely decorative.
            transform: "scale(1.35)",
            transformOrigin: "center",
            // YouTube iframes ignore object-fit; scaling is the only honest way.
          }}
        />
      ) : (
        <video
          ref={videoRef}
          src={resolvedVideoUrl}
          poster={resolvedPosterUrl}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(24,20,16,0.22) 0%, rgba(24,20,16,0.55) 100%)",
          opacity: overlayOpacity,
        }}
      />

      {/* Optional overlay copy */}
      {(eyebrow || title) && (
        <div className="relative h-full">
          <div className="container-editorial h-full flex items-end pb-16">
            <div className="text-paper max-w-2xl">
              {eyebrow && (
                <span
                  className="eyebrow-bare"
                  style={{ color: "var(--honey-light)" }}
                >
                  {eyebrow}
                </span>
              )}
              {title && (
                <h2
                  className="display display-l mt-5"
                  style={{ color: "var(--paper)" }}
                >
                  {title}
                  {italicAccent && (
                    <>
                      {" "}
                      <span
                        className="italic-accent"
                        style={{ color: "var(--honey-light)" }}
                      >
                        {italicAccent}
                      </span>
                    </>
                  )}
                </h2>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
