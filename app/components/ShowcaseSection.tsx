import { useEffect, useState } from "react";

export interface ShowcaseItem {
  video_url: string;
  title?: string;
  description?: string;
}

function youTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

/**
 * Showcase grid — a 3-column grid of video thumbnails with title,
 * description, and a "Find Out More" button. Clicking opens a gated
 * popup (newsletter signup) before playing the video.
 */
export function ShowcaseSection({
  items,
  onPlay,
  onFindOutMore,
  fallbackCover = "",
}: {
  items: ShowcaseItem[];
  onPlay: (url: string) => void;
  onFindOutMore: (item: ShowcaseItem) => void;
  fallbackCover?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (items.length === 0) return null;

  return (
    <div className="showcase-grid">
      {items.map((item, i) => {
        const ytId = youTubeId(item.video_url);
        const cover = ytId
          ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
          : fallbackCover;
        return (
          <div
            key={i}
            className="showcase-card"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(24px)",
              transition: `opacity 0.6s var(--ease) ${i * 80}ms, transform 0.6s var(--ease) ${i * 80}ms`,
            }}
          >
            <button
              type="button"
              className="showcase-thumb"
              onClick={() => onFindOutMore(item)}
              aria-label={item.title ? `Play ${item.title}` : "Play showcase video"}
            >
              {cover ? (
                <img src={cover} alt="" loading="lazy" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              )}
              <span className="play" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>

            <div className="showcase-body">
              {item.title && (
                <h4 className="showcase-title">{item.title}</h4>
              )}
              {item.description && (
                <p className="showcase-desc">{item.description}</p>
              )}
              <button
                type="button"
                className="showcase-cta"
                onClick={() => onFindOutMore(item)}
              >
                Find Out More
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
