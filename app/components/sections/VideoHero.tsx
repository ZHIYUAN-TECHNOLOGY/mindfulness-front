import { useEffect, useRef } from "react";
import { resolveMediaUrl } from "../../lib/media";

interface Props {
  videoUrl: string | null;
  overlayText: string;
  overlayOpacity: number;
  showOverlay?: boolean;
}

function isYouTubeUrl(url: string): boolean {
  return /youtube\.com\/embed|youtu\.be\//.test(url);
}

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.split("/").filter(Boolean)[0] || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/").filter(Boolean)[1] || null;
      return u.searchParams.get("v");
    }
  } catch {}
  return null;
}

function getVideoMimeType(url: string): string | undefined {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith(".mp4")) return "video/mp4";
    if (pathname.endsWith(".webm")) return "video/webm";
  } catch {
    const clean = url.split("?")[0].toLowerCase();
    if (clean.endsWith(".mp4")) return "video/mp4";
    if (clean.endsWith(".webm")) return "video/webm";
  }
  return undefined;
}

export function VideoHero({ videoUrl, overlayText, overlayOpacity, showOverlay = true }: Props) {
  const hasVideo = Boolean(videoUrl && videoUrl.trim());
  const ytId = videoUrl && isYouTubeUrl(videoUrl) ? getYouTubeId(videoUrl) : null;
  const ytThumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null;
  const ytWatch = ytId ? `https://www.youtube.com/watch?v=${ytId}` : videoUrl || "#";
  const videoMimeType = videoUrl ? getVideoMimeType(videoUrl) : undefined;
  const posterUrl = ytThumb || undefined;
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section || !videoUrl || isYouTubeUrl(videoUrl)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 1] }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [videoUrl]);

  return (
    <section ref={sectionRef} className="relative w-full min-h-[72dvh] md:min-h-[88dvh] xl:min-h-[94dvh] flex items-center justify-center overflow-hidden bg-[#2a1c08] reveal-in">
      {hasVideo ? (
        isYouTubeUrl(videoUrl as string) ? (
          <>
            <div className="absolute inset-0 w-full h-full overflow-hidden hidden md:block">
              <iframe
                src={videoUrl || undefined}
                title="Background video"
                className="absolute top-1/2 left-1/2 w-[177.78vh] h-[100vh] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2"
                style={{ border: "none", pointerEvents: "none" }}
                allow="autoplay; encrypted-media"
                allowFullScreen={false}
              />
            </div>
            <a href={ytWatch} target="_blank" rel="noopener noreferrer" className="absolute inset-0 w-full h-full block md:hidden" aria-label="Open video on YouTube">
              {ytThumb ? <img src={ytThumb} alt="Video thumbnail" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black/40" />}
            </a>
          </>
        ) : (
          <video ref={videoRef} autoPlay loop muted playsInline preload="metadata" poster={posterUrl} className="absolute inset-0 w-full h-full object-cover">
            <source src={resolveMediaUrl(videoUrl || "")} type={videoMimeType} />
          </video>
        )
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#4f3812] via-[#7a5a1d] to-[#2f220b] flex items-center justify-center">
          <div className="rounded-[2rem] border border-[#f5d78e]/35 bg-[#fff5dd]/90 px-8 py-10 text-center shadow-2xl">
            <p className="ui-label text-[#6a4d17] mb-3">Video Section</p>
            <h3 className="text-2xl md:text-3xl font-serif text-[#3a2518] mb-2">Hero Video Missing</h3>
            <p className="text-[#6c4f1a]">Set <span className="font-semibold">hero.video_url</span> in admin settings.</p>
          </div>
        </div>
      )}
      <div className="absolute inset-0 z-[1]" style={{ background: hasVideo ? `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity * 0.55}), rgba(61,43,10,${overlayOpacity})), linear-gradient(to right, rgba(0,0,0,0.35), transparent, rgba(0,0,0,0.35))` : undefined, backgroundColor: hasVideo ? undefined : "rgba(0,0,0,0.35)" }} />
      {showOverlay && (
        <div className="relative z-10 text-center text-gold-pale px-4 sm:px-6 max-w-4xl mx-auto reveal-up">
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-5 sm:mb-6 tracking-tight drop-shadow-lg">{overlayText}</h2>
          <div className="w-28 h-1 bg-gold-primary mx-auto rounded-full opacity-80" />
        </div>
      )}
    </section>
  );
}
