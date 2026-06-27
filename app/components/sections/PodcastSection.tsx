import { useRef } from "react";

interface Episode {
  title: string;
  thumbnail_media_id?: string;
  video_url: string;
  duration: string;
  description: string;
}

interface Props {
  heading: string;
  subheading: string;
  episodes: Episode[];
  mediaAssets: Record<string, string>;
  limit?: number;
  mode?: "carousel" | "grid";
  showViewAll?: boolean;
}

function isUsableUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/api/");
}

function looksLikeImageUrl(value: string | null | undefined): value is string {
  if (!isUsableUrl(value)) return false;
  const v = value.toLowerCase();
  if (v.includes("/api/upload/media/")) return true;
  return [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".svg"].some((ext) => v.includes(ext));
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.split("/").filter(Boolean)[0] || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/").filter(Boolean)[1] || null;
      return u.searchParams.get("v");
    }
  } catch {}
  return null;
}

function renderCard(ep: Episode, i: number, mediaAssets: Record<string, string>, mode?: string) {
  const explicitRaw = ep.thumbnail_media_id ? (mediaAssets[ep.thumbnail_media_id] || ep.thumbnail_media_id) : null;
  const explicitThumbUrl = looksLikeImageUrl(explicitRaw) ? explicitRaw : null;
  const ytId = getYouTubeId(ep.video_url);
  const fallbackThumbUrl = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null;
  const thumbUrl = explicitThumbUrl || fallbackThumbUrl;

  const widthClass = mode === "carousel" ? "flex-shrink-0 w-[80vw] sm:w-[42vw] md:w-[28vw] lg:w-[22vw] xl:w-[18vw] snap-start" : "block";

  return (
    <a key={i} href={ep.video_url} target="_blank" rel="noopener noreferrer" className={`${widthClass} card-hover-lift bg-[#fff7e3] border border-[#cda24c]/45 rounded-[18px] shadow-lg shadow-[#8f6920]/15 overflow-hidden hover:border-[#996b1c]/70 hover:shadow-xl transition reveal-up`}>
      <div className="aspect-[4/3] bg-[#e9d7ac] relative overflow-hidden">
        {thumbUrl ? (
          <img src={thumbUrl} alt={ep.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brown-dark/40">No Thumbnail</div>
        )}
        <span className="absolute bottom-2 right-2 ui-label bg-brown-dark/85 text-gold-pale px-2 py-1 border border-gold-light/10 rounded">{ep.duration}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-brown-dark text-base leading-snug line-clamp-2 mb-1">{ep.title}</h3>
        <p className="text-sm text-brown-dark/75 line-clamp-2 font-serif">{ep.description}</p>
      </div>
    </a>
  );
}

export function PodcastSection({ heading, subheading, episodes, mediaAssets, limit, mode = "carousel", showViewAll = false }: Props) {
  const displayedEpisodes = limit ? episodes.slice(0, limit) : episodes;
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.getBoundingClientRect().width || 320;
    const gap = 16;
    const amount = dir === "left" ? -(cardWidth + gap) : cardWidth + gap;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <section id="podcast" className="section-padded reveal-in bg-[#f4e6c3] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.22]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='32' height='64' viewBox='0 0 32 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 28h20V16h-4v8H4V4h28v28h-4V8H8v12h4v-8h12v20H0v-4zm12 8h20v4H16v24H0v-4h12V36zm16 12h-4v12h8v4H20V44h12v12h-4v-8zM0 36h8v20H0v-4h4V40H0v-4z' fill='%23b07810' fill-opacity='0.12' fill-rule='evenodd'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="ui-label text-gold-primary text-center mb-3 reveal-up">{subheading}</p>
        <h2 className="heading-2 font-serif font-semibold text-center mb-4 text-brown-dark reveal-up delay-1">{heading}</h2>
        <div className="gold-separator mx-auto mb-10 reveal-up delay-2" />

        {mode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{displayedEpisodes.map((ep, i) => renderCard(ep, i, mediaAssets))}</div>
        ) : (
          <div className="relative group">
            <button onClick={() => scroll("left")} className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-brown-dark/85 border border-gold-light/25 text-gold-pale flex items-center justify-center shadow-lg hover:bg-brown-dark transition opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Scroll left">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => scroll("right")} className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-brown-dark/85 border border-gold-light/25 text-gold-pale flex items-center justify-center shadow-lg hover:bg-brown-dark transition opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label="Scroll right">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {displayedEpisodes.map((ep, i) => renderCard(ep, i, mediaAssets, "carousel"))}
            </div>
          </div>
        )}

        {showViewAll && (
          <div className="pt-8 text-center">
            <a
              href="/podcast"
              className="ui-button inline-flex items-center justify-center border border-[#8a621e]/25 bg-[#f9edcf] px-7 py-3 text-[#4b3218] shadow-[0_10px_24px_rgba(83,56,17,0.08)] transition hover:-translate-y-0.5 hover:border-[#8a621e]/45 hover:bg-[#fff5dd] active:translate-y-0"
            >
              View All Episodes
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
