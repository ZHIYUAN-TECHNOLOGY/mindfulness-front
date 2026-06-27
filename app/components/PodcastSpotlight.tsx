import { useEffect, useState } from "react";

export interface SpotlightItem {
  video_url: string;
}

function youTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

const ROTATE_MS = 10000;

/**
 * "Now playing" spotlight — a carousel of featured videos that auto-advances
 * every 10s, with prev/next arrows and dots directly below the video. The
 * description is static (does not change with the video).
 */
export function PodcastSpotlight({
  items,
  description,
  onPlay,
  fallbackCover = "",
}: {
  items: SpotlightItem[];
  description: string;
  onPlay: (url: string) => void;
  fallbackCover?: string;
}) {
  const [idx, setIdx] = useState(0);
  const count = items.length;

  // Auto-advance; the timer resets whenever `idx` changes (incl. manual nav).
  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), ROTATE_MS);
    return () => clearInterval(t);
  }, [count, idx]);

  if (count === 0) return null;

  const safeIdx = idx % count;
  const item = items[safeIdx];
  const ytId = youTubeId(item.video_url);
  const cover = ytId
    ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
    : fallbackCover;

  const go = (n: number) => setIdx(((n % count) + count) % count);

  return (
    <div className="pod-carousel">
      <div className="pod-master">
        <div>
          <span className="pm-tag">
            <span className="live" />
            Now playing · Spotlight
          </span>
          {description && <div className="pm-desc">{description}</div>}
        </div>

        <div>
          <button
            type="button"
            className="pod-feature"
            onClick={() => onPlay(item.video_url)}
            aria-label="Play spotlight video"
          >
            {cover && <img src={cover} alt="" loading="lazy" />}
            <span className="big-play">
              <svg width="26" height="30" viewBox="0 0 14 16">
                <path d="M0 0v16l14-8L0 0z" fill="currentColor" />
              </svg>
            </span>
          </button>

          {count > 1 && (
            <div className="pod-carousel__nav">
              <button
                type="button"
                className="pod-carousel__arrow"
                onClick={() => go(safeIdx - 1)}
                aria-label="Previous video"
              >
                ‹
              </button>
              <div className="pod-carousel__dots">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`pod-carousel__dot${i === safeIdx ? " is-active" : ""}`}
                    onClick={() => setIdx(i)}
                    aria-label={`Go to video ${i + 1}`}
                    aria-current={i === safeIdx}
                  />
                ))}
              </div>
              <button
                type="button"
                className="pod-carousel__arrow"
                onClick={() => go(safeIdx + 1)}
                aria-label="Next video"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
