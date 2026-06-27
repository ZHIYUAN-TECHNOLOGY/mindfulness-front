import { useEffect, useRef, useState } from "react";
import { normalizeMediaUrl } from "../lib/media";

interface Props {
  src: string | null | undefined;
  alt: string;
  /** Shown when src is empty, loading, or errors. Must include "src" too if you want to swap. */
  fallbackSrc?: string;
  /** Initials shown when no fallback image is available. */
  fallbackInitials?: string;
  /** Disable picsum auto-fallback if you want a strict "no image" empty state. */
  noFallbackImage?: boolean;
  className?: string;
  loading?: "lazy" | "eager";
}

/**
 * Image that resolves cleanly when the source is missing or broken:
 *   • shows a paper-deep block while the image is fetching
 *   • swaps to `fallbackSrc` (or a typographic placeholder) on `onError`
 *   • never leaves a broken-image icon behind.
 *
 * Use for hero portraits, book covers, anywhere a media setting can be empty.
 */
export function PortraitImage({
  src,
  alt,
  fallbackSrc,
  fallbackInitials,
  noFallbackImage = false,
  className = "",
  loading = "lazy",
}: Props) {
  const resolvedSrc = normalizeMediaUrl(src);
  const resolvedFallback = normalizeMediaUrl(fallbackSrc) || undefined;

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    resolvedSrc ? "loading" : "error"
  );

  // Reset the status if the src changes (admin updating media url, etc.)
  useEffect(() => {
    setStatus(resolvedSrc ? "loading" : "error");
  }, [resolvedSrc]);

  // SSR/hydration race: an `eager` above-the-fold image can finish loading
  // before React attaches the onLoad handler, so the load event is missed and
  // the image would stay invisible (opacity 0) forever. After mount, if the
  // <img> is already complete, resolve the status from it directly.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete) {
      setStatus(img.naturalWidth > 0 ? "loaded" : "error");
    }
  }, [resolvedSrc]);

  const showImage = resolvedSrc && status !== "error";
  const showFallbackImage = !showImage && resolvedFallback && !noFallbackImage;
  const showPlaceholder = !showImage && !showFallbackImage;

  return (
    <>
      {showImage && (
        <img
          ref={imgRef}
          src={resolvedSrc}
          alt={alt}
          loading={loading}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={className}
          style={{
            opacity: status === "loaded" ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />
      )}
      {showFallbackImage && (
        <img
          src={resolvedFallback}
          alt={alt}
          loading={loading}
          className={className}
        />
      )}
      {showPlaceholder && (
        <div
          className={`grid place-items-center w-full h-full ${className}`}
          style={{ background: "var(--paper-deep)" }}
          role="img"
          aria-label={alt}
        >
          <span
            style={{
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: "clamp(36px, 5vw, 64px)",
              color: "var(--honey-deep)",
              letterSpacing: "-0.02em",
            }}
          >
            {fallbackInitials || alt.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </>
  );
}
