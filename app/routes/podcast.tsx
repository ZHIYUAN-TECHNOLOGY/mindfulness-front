import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { ScrollReveal } from "../components/ScrollReveal";
import { FooterSection } from "../components/sections/FooterSection";
import { normalizeMediaUrl } from "../lib/media";
import { VideoPopup } from "../components/VideoPopup";
import { SubscribeGate } from "../components/SubscribeGate";
import { useGatedPlay } from "../hooks/useGatedPlay";
import { useAuth } from "./__root";

export const Route = createFileRoute("/podcast")({
  component: PodcastPage,
  head: () => ({
    meta: [
      { title: "The Slow Return — Podcast · Dr. Charles Lee" },
      {
        name: "description",
        content:
          "Long-form conversations for the long way home, hosted by Dr. Charles Lee.",
      },
    ],
  }),
});

interface Episode {
  title: string;
  thumbnail_media_id?: string;
  video_url: string;
  duration: string;
  description: string;
}

// Extracts an 11-char YouTube video ID from a watch / youtu.be / embed URL.
function getYouTubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function youTubeThumbnail(videoUrl: string | undefined): string | null {
  const id = getYouTubeId(videoUrl);
  // hqdefault is universally available; maxresdefault sometimes 404s.
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

// Resolve a cover image for an episode: explicit thumbnail → YouTube still →
// the global podcast cover. Empty string means "no image".
function coverFor(ep: Episode, fallbackCover: string): string {
  if (ep.thumbnail_media_id) return normalizeMediaUrl(ep.thumbnail_media_id);
  return youTubeThumbnail(ep.video_url) || fallbackCover || "";
}

const FALLBACK_EPISODES: Episode[] = [
  { title: "The grammar of attention, with Hadiya Sundström", video_url: "/podcast", duration: "1h 12m", description: "May 12 · Guest · Theologian, translator" },
  { title: "Pain, prayer, and the parts of us that wait", video_url: "/podcast", duration: "58m", description: "May 5 · Solo" },
  { title: "Joaquín Reyes on the body that remembers", video_url: "/podcast", duration: "1h 04m", description: "Apr 28 · Guest · Trauma physician" },
  { title: "Mirelle Vauthier-Kim — what dying teaches the living", video_url: "/podcast", duration: "1h 22m", description: "Apr 21 · Guest · Hospice chaplain" },
  { title: "The unhurried hour — a long-form practice", video_url: "/podcast", duration: "1h 18m", description: "Apr 14 · Solo · A guided practice" },
  { title: "Yusra al-Khalidi on liturgy, exile, and the slow return", video_url: "/podcast", duration: "1h 31m", description: "Apr 7 · Guest · Poet" },
  { title: "Three years of pandemic — what stayed, what left", video_url: "/podcast", duration: "1h 06m", description: "Mar 31 · Solo" },
  { title: "Beverly Tang-Ramírez on neuroplasticity, slowly", video_url: "/podcast", duration: "1h 14m", description: "Mar 24 · Guest · Neurologist" },
  { title: "The desert fathers, for the rest of us", video_url: "/podcast", duration: "1h 28m", description: "Mar 17 · Solo · Practice notes" },
];

function PodcastPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [visible, setVisible] = useState(9);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const { user } = useAuth();
  const { gateOpen, closeGate, requestPlay, onSubscribed } = useGatedPlay(user?.email);

  useEffect(() => {
    apiFetch("/api/settings").then(setSettings).catch(() => {});
  }, []);

  const episodes =
    (settings["podcast.episodes"] as Episode[]) && (settings["podcast.episodes"] as Episode[]).length
      ? (settings["podcast.episodes"] as Episode[])
      : FALLBACK_EPISODES;

  const navLinks =
    (settings["nav.links"] as Array<{ label: string; href: string }>) || [];
  const socialLinks =
    (settings["footer.social_links"] as Array<{ platform: string; url: string }>) || [];
  const podcastCover = normalizeMediaUrl(settings["podcast.cover_url"] as string);

  // Pick a random featured episode on every page load — stable within a render.
  const latest = useMemo(() => {
    if (!episodes.length) return undefined;
    return episodes[Math.floor(Math.random() * episodes.length)];
  }, [episodes]);
  const remaining = episodes.slice(0, visible);

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden pt-[160px] pb-[100px] min-h-[100dvh]">
        <div className="container-editorial">
          <div className="grid items-center gap-10 md:gap-[clamp(40px,5vw,80px)] md:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="eyebrow reveal in">
                {(settings["podcast.eyebrow"] as string) ||
                  `The podcast · ${episodes.length} episodes · since 2022`}
              </span>
              <h1 className="display display-xl mt-7 reveal in delay-1">
                The Slow
                <br />
                <span className="italic-accent">Return</span>.
              </h1>
              <p className="lead mt-8 reveal in delay-2">
                {(settings["podcast.subheading"] as string) ||
                  "Long-form conversations between Dr. Charles Lee and the practitioners, theologians, neurologists, and quiet thinkers who have shaped his thirty-one-year practice. Most Tuesdays, ninety minutes, no advertising."}
              </p>
            </div>

            <div className="reveal in delay-2">
              <a
                href={latest?.video_url || "#"}
                onClick={(e) => {
                  e.preventDefault();
                  if (latest?.video_url) requestPlay(latest.video_url, setVideoUrl);
                }}
                className="block group"
              >
                <div className="photo-warm relative aspect-video">
                  {(() => {
                    const src =
                      youTubeThumbnail(latest?.video_url) ||
                      normalizeMediaUrl(settings["podcast.cover_url"] as string);
                    if (!src) return null;
                    return (
                      <img
                        src={src}
                        alt={latest?.title || "Featured episode"}
                      />
                    );
                  })()}
                </div>
                <div className="mt-6">
                  <span className="label-meta">
                    No. {String(episodes.length).padStart(3, "0")} · {latest?.duration || ""}
                  </span>
                  <h3 className="display display-s mt-2.5">{latest?.title}</h3>
                  <p className="body-prose mt-2.5" style={{ fontSize: 17 }}>
                    {latest?.description}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ALL EPISODES */}
      <section className="section-y" id="all">
        <div className="container-editorial">
          <ScrollReveal animation="scroll-reveal-up">
            <div className="mb-14">
              <span className="eyebrow mb-5 inline-flex">
                All episodes · {episodes.length}
              </span>
              <h2 className="display mt-2" style={{ fontSize: "clamp(40px, 5.5vw, 72px)" }}>
                A small <span className="italic-accent">archive,</span>
                <br />
                slowly built.
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
            <div>
              {remaining.map((ep, idx) => {
                const cover = coverFor(ep, podcastCover);
                return (
                  <a
                    key={ep.title + idx}
                    href={ep.video_url || "#"}
                    onClick={(e) => {
                      e.preventDefault();
                      if (ep.video_url) requestPlay(ep.video_url, setVideoUrl);
                    }}
                    className="card-row"
                  >
                    <div className="card-row-cover">
                      {cover ? (
                        <img src={cover} alt={ep.title} loading="lazy" />
                      ) : (
                        <div className="ph" />
                      )}
                      <span className="num">
                        No. {String(episodes.length - idx).padStart(3, "0")}
                      </span>
                    </div>
                    <div>
                      <div className="title">{ep.title}</div>
                      <div className="meta">
                        {ep.description} · {ep.duration}
                      </div>
                    </div>
                    <button className="play" aria-label="Play" type="button">
                      <svg width="14" height="16" viewBox="0 0 14 16">
                        <path d="M0 0v16l14-8L0 0z" fill="#181410" />
                      </svg>
                    </button>
                  </a>
                );
              })}
            </div>
          </ScrollReveal>

          {visible < episodes.length && (
            <ScrollReveal animation="scroll-reveal-up" delay="delay-2">
              <div className="flex justify-between items-center mt-12 flex-wrap gap-4">
                <span className="label-meta">
                  Showing {Math.min(visible, episodes.length)} of {episodes.length}
                </span>
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + 9)}
                  className="btn-ed btn-ghost"
                >
                  Load 9 more <span className="btn-arrow">↓</span>
                </button>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      <FooterSection
        copyright={
          (settings["footer.copyright"] as string) ||
          "Copyright © 2026"
        }
        poweredBy={
          (settings["footer.powered_by"] as string) ||
          "Powered by ZYT"
        }
        contactUrl={(settings["footer.contact_url"] as string) || "/contact"}
        socialLinks={socialLinks}
        navLinks={navLinks}
        brandName={(settings["footer.brand"] as string) || "Charles Lee"}
        tagline={
          (settings["footer.tagline"] as string) ||
          "Founder of the Asia Pacific Consultation On Marketplace Mindfulness, APCOMM."
        }
      />

      <VideoPopup url={videoUrl} onClose={() => setVideoUrl(null)} />
      <SubscribeGate
        open={gateOpen}
        onClose={closeGate}
        onSubscribed={() => onSubscribed(setVideoUrl)}
        defaultEmail={user?.email || ""}
      />
    </main>
  );
}
