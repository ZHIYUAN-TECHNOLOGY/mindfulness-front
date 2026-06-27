import { useState } from "react";
import { resolveMediaUrl } from "../lib/media";

/**
 * Small square thumbnail for admin media picker fields — quick visual
 * reference next to the "Pick from Media" button. Renders nothing when the
 * value is empty or does not load as an image (e.g. a video URL).
 */
export function MediaThumb({
  url,
  size = 44,
}: {
  url: string | null | undefined;
  size?: number;
}) {
  const src = resolveMediaUrl(url);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) return null;

  return (
    <img
      src={src}
      alt=""
      onError={() => setFailedSrc(src)}
      className="rounded object-cover border border-gold-light/20 shrink-0"
      style={{ width: size, height: size }}
    />
  );
}
