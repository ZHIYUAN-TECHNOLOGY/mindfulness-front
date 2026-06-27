import { normalizeMediaUrl } from "../lib/media";

export interface EventVideo {
  id: string;
  title: string;
  provider: string;
  thumbnailUrl: string | null;
  sortOrder: number;
  locked: boolean;
}

interface Props {
  videos: EventVideo[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

export function EventVideoList({ videos, activeId, onSelect }: Props) {
  if (videos.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
      {videos.map((video) => {
        const isActive = activeId === video.id;
        const thumb = video.thumbnailUrl ? normalizeMediaUrl(video.thumbnailUrl) : null;

        return (
          <button
            key={video.id}
            type="button"
            onClick={() => onSelect(video.id)}
            aria-current={isActive ? "true" : undefined}
            className={`event-video-card group text-left ${
              isActive ? "event-video-card--active" : ""
            } ${video.locked ? "event-video-card--locked" : ""}`}
          >
            <div className="event-video-card__thumb">
              {thumb ? (
                <img
                  src={thumb}
                  alt={video.title}
                  loading="lazy"
                  className="event-video-card__img"
                />
              ) : (
                <div className="event-video-card__fallback">
                  <PlayIcon className="w-10 h-10 text-gold-light/30" />
                </div>
              )}

              <div className="event-video-card__overlay">
                {video.locked ? (
                  <div className="event-video-card__lock">
                    <LockIcon className="w-7 h-7 text-gold-pale" />
                    <span className="text-xs font-semibold tracking-wider uppercase text-gold-pale mt-1">Members only</span>
                  </div>
                ) : (
                  <div className="event-video-card__play">
                    <PlayIcon className="w-7 h-7 text-gold-pale" />
                  </div>
                )}
              </div>

              {isActive && !video.locked && (
                <span className="event-video-card__badge">Now playing</span>
              )}
            </div>

            <div className="event-video-card__body">
              <p className="event-video-card__title">{video.title}</p>
              {video.locked ? (
                <p className="event-video-card__meta">Members only · unlock to watch</p>
              ) : (
                <p className="event-video-card__meta">Click to watch</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
