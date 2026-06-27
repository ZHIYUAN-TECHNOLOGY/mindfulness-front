import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api";
import { extractKeywords } from "../lib/seo";
import { NewsletterSignup } from "../components/NewsletterSignup";
import { FooterSection } from "../components/sections/FooterSection";
import { ScrollReveal } from "../components/ScrollReveal";
import { EventCountdown } from "../components/EventCountdown";
import { BackgroundVideoSection } from "../components/BackgroundVideoSection";
import { PortraitImage } from "../components/PortraitImage";
import { normalizeMediaUrl, resolveMediaUrl } from "../lib/media";
import { useAuth } from "./__root";
import { VideoPopup } from "../components/VideoPopup";
import { WelcomingModal } from "../components/WelcomingModal";
import { PodcastSpotlight, type SpotlightItem } from "../components/PodcastSpotlight";
import { ShowcaseSection, type ShowcaseItem } from "../components/ShowcaseSection";
import { SubscribeGate } from "../components/SubscribeGate";
import { useGatedPlay } from "../hooks/useGatedPlay";
import { useGatedRegister } from "../hooks/useGatedRegister";
import { EventRegisterModal } from "../components/EventRegisterModal";

/** Extract an 11-char YouTube video id from any common YouTube URL form. */
function youTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

/** Inline video that auto-plays when the section scrolls into view.
 *  `playing` is controlled by the parent section so the video keeps
 *  playing while the user scrolls through the text on the same section. */
function InlineAutoplayVideo({
  url,
  cover,
  className,
  playing,
}: {
  url: string;
  cover: string;
  className?: string;
  playing?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (playing) {
      setHasEntered(true);
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
    }
  }, [playing]);

  const ytId = youTubeId(url);

  if (ytId) {
    return (
      <div className={className}>
        {hasEntered ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&rel=0&playsinline=1`}
            className="w-full h-full"
            style={{ border: 0, display: "block" }}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Welcome video"
          />
        ) : cover ? (
          <img
            src={cover}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="welcoming-video__ph" />
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <video
        ref={videoRef}
        src={url}
        poster={cover || undefined}
        muted
        playsInline
        loop
        controls
        preload="metadata"
        className="w-full h-full object-cover"
        style={{ display: "block" }}
      />
    </div>
  );
}

export const Route = createFileRoute("/")({
  loader: async () => {
    const settings = await apiFetch("/api/settings");
    return { settings };
  },
  component: HomeComponent,
  head: ({ loaderData }) => {
    const settings = loaderData?.settings || {};
    const title =
      (settings["seo.title"] as string) ||
      (settings["site.title"] as string) ||
      "Mindfulness to Change";
    const description =
      (settings["seo.description"] as string) ||
      (settings["about.body"] as string) ||
      "";
    const keywords = extractKeywords(
      `${title} ${description} ${settings["books.description"] || ""} ${settings["podcast.subheading"] || ""}`,
      (settings["seo.keywords"] as string) || ""
    );
    const ogImage =
      (settings["seo.og_image_url"] as string) ||
      (settings["hero.video_url"] as string) ||
      (settings["about.media_url"] as string) ||
      (settings["books.cover_url"] as string) ||
      null;
    const canonical = (settings["seo.canonical_url"] as string) || "";
    const twitterHandle = (settings["seo.twitter_handle"] as string) || "";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        ...(ogImage ? [{ property: "og:image", content: ogImage }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(ogImage ? [{ name: "twitter:image", content: ogImage }] : []),
        ...(twitterHandle
          ? [{ name: "twitter:site", content: `@${twitterHandle.replace(/^@/, "")}` }]
          : []),
      ],
      links: canonical ? [{ rel: "canonical", href: canonical }] : [],
    };
  },
});

interface Episode {
  title: string;
  thumbnail_media_id?: string;
  video_url: string;
  duration: string;
  description: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  location: string | null;
  imageUrl: string | null;
  status: string;
  isActive: boolean;
}


function HomeComponent() {
  const { settings } = Route.useLoaderData();
  const { user } = useAuth();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [welcomingOpen, setWelcomingOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showcaseGateOpen, setShowcaseGateOpen] = useState(false);
  const [activeShowcaseItem, setActiveShowcaseItem] = useState<ShowcaseItem | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const defaultRegisterCopy = {
    eyebrow: "Reserve your seat",
    title: (
      <>
        Enter your email below
        <br />
        <span className="italic-accent">to reserve your early bird seat.</span>
      </>
    ),
    description: (
      <>
        Reserve your early bird seat and receive the latest updates, videos, and the Sunday letter.
      </>
    ),
    successTitle: "You're in.",
    successDescription: (
      <>
        Welcome to the list — taking you to the reservation page now.
      </>
    ),
    ctaText: "Send",
  };

  const [registerGateCopy, setRegisterGateCopy] = useState(defaultRegisterCopy);
  const [bookLightboxIndex, setBookLightboxIndex] = useState<number | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const featuredEvent = upcomingEvents[0];

  const welcomingSectionRef = useRef<HTMLElement>(null);
  const welcomingVideoRef = useRef<HTMLDivElement>(null);
  const textColumnRef = useRef<HTMLDivElement>(null);
  const [welcomingVisible, setWelcomingVisible] = useState(false);

  useEffect(() => {
    const el = welcomingSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setWelcomingVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* Floating video — follows the text column scroll (desktop only) */
  useEffect(() => {
    const video = welcomingVideoRef.current;
    const textCol = textColumnRef.current;
    if (!video || !textCol) return;

    const isDesktop = () => window.innerWidth >= 768;

    const onScroll = () => {
      if (!isDesktop()) {
        video.style.transform = "";
        return;
      }

      const textHeight = textCol.offsetHeight;
      const videoHeight = video.offsetHeight;
      const maxOffset = Math.max(0, textHeight - videoHeight * 0.6);

      const sectionRect = welcomingSectionRef.current?.getBoundingClientRect();
      if (!sectionRect) return;
      const viewportH = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (viewportH - sectionRect.top) / (viewportH + sectionRect.height)));
      const offset = progress * maxOffset;

      video.style.transform = `translateY(${offset}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* Scroll-to-top button visibility */
  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { gateOpen, closeGate, requestPlay, onSubscribed } = useGatedPlay(user?.email);
  const {
    gateOpen: registerGateOpen,
    closeGate: closeRegisterGate,
    onSubscribed: onRegisterSubscribed,
  } = useGatedRegister(user?.email);

  useEffect(() => {
    apiFetch("/api/events")
      .then((data) => {
        const list = (data?.events || []) as UpcomingEvent[];
        const future = list
          .filter((e) => e.isActive && new Date(e.eventDate).getTime() > Date.now())
          .sort(
            (a, b) =>
              new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
          );
        setUpcomingEvents(future);
      })
      .catch(() => setUpcomingEvents([]));
  }, []);

  const heroEyebrow =
    (settings["hero.eyebrow"] as string) || "The power of living in the present";
  const heroTitle = (settings["site.title"] as string) || "Mindfulness to Change";
  const heroSlogan = (settings["site.slogan"] as string) || "From Death to Life";
  const heroBody =
    (settings["hero.body"] as string) ||
    (settings["about.body"] as string) ||
    "A memoir, a podcast, and a quiet discipline for the people learning to begin again — written and gathered over thirty-one years of practice in mindfulness, faith, and the body's slow return.";
  const heroPortrait = resolveMediaUrl(
    (settings["hero.author_image_url"] as string) ||
      (settings["about.media_url"] as string)
  );
  const signatureUrl = resolveMediaUrl(settings["hero.signature_url"] as string);
  const signatureWidth = (settings["hero.signature_width"] as number) || 200;
  const heroVideoUrl = resolveMediaUrl(settings["hero.video_url"] as string);
  const heroBannerUrl = resolveMediaUrl(settings["hero.banner_url"] as string);
  const signatureBottom = (settings["hero.signature_bottom"] as number) ?? 28;
  const signatureRight = (settings["hero.signature_right"] as number) ?? 28;

  const marqueeWords =
    (settings["marquee.words"] as string[]) || [
      "Christian Mindfulness",
      "Faith",
      "Hebraic Wakefulness",
      "Memoir",
      "Transformation",
      "Change",
    ];

  // Welcoming section — sits between the marquee and the About section.
  // Left: video (admin sets URL or picks from media library). Right: eyebrow + title + body.
  const welcomingEyebrow = (settings["welcoming.eyebrow"] as string) || "";
  const welcomingTitle = (settings["welcoming.title"] as string) || "";
  const welcomingBody = (settings["welcoming.body"] as string) || "";
  const welcomingQuote = (settings["welcoming.quote"] as string) || "";
  const welcomingVideoUrl =
    resolveMediaUrl(settings["welcoming.video_media_url"] as string) ||
    resolveMediaUrl(settings["welcoming.video_url"] as string) ||
    "";
  const welcomingCoverUrl = (settings["welcoming.video_cover_url"] as string) || "";
  const welcomingCover = (() => {
    if (welcomingCoverUrl) return welcomingCoverUrl;
    if (!welcomingVideoUrl) return "";
    const m = welcomingVideoUrl.match(
      /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : "";
  })();

  const aboutHeading =
    (settings["about.heading"] as string) || "A life learned,";
  const aboutEyebrow =
    (settings["about.eyebrow"] as string) ||
    "Plastic Surgeon · Visionary · Author · Podcaster";
  const aboutBody =
    (settings["about.body"] as string) ||
    "Trained as a physician and a contemplative, Charles Lee writes for those moving between two lives — the one they were given and the one they are quietly building. His work draws from clinical neuroscience, the Christian contemplative tradition, and the everyday craft of paying attention.";
  const bookHeading = (settings["books.title"] as string) || "From Death";
  const bookHeadingAccent = (settings["books.title_accent"] as string) || "";
  const bookEyebrow =
    (settings["books.eyebrow"] as string) || "A Plastic Surgeon’s Memoir";
  const bookLead =
    (settings["books.lead"] as string) ||
    '"I did not want to be a writer. I wanted to be well. The book came as the breath came — after long stillness."';
  const bookBody =
    (settings["books.description"] as string) ||
    "Seven chapters tracing thirty-one years of practice, illness, and slow recovery. A book for the people who are not yet ready for a solution and would rather, first, be seen.";
  const bookCover = resolveMediaUrl(settings["books.cover_url"] as string);

  const episodes =
    (settings["podcast.episodes"] as Episode[]) || [
      {
        title: "The grammar of attention, with Hadiya Sundström",
        video_url: "/podcast",
        duration: "1h 12m",
        description: "May 12, 2026 · Theologian, translator",
      },
      {
        title: "Pain, prayer, and the parts of us that wait",
        video_url: "/podcast",
        duration: "58m",
        description: "May 5, 2026 · Solo episode",
      },
      {
        title: "Joaquín Reyes on the body that remembers",
        video_url: "/podcast",
        duration: "1h 04m",
        description: "April 28, 2026 · Trauma physician",
      },
      {
        title: "Mirelle Vauthier-Kim — what dying teaches the living",
        video_url: "/podcast",
        duration: "1h 22m",
        description: "April 21, 2026 · Hospice chaplain",
      },
    ];

  // Resolve a cover image for an episode: explicit thumbnail → YouTube still →
  // the global podcast cover. Empty string means "fall back to the gradient".
  const podcastCover = resolveMediaUrl(settings["podcast.cover_url"] as string);
  const looksLikeImage = (s?: string | null) =>
    !!s &&
    (/\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(s) ||
      s.includes("/api/upload/media/"));
  const youTubeId = (u?: string | null) => {
    if (!u) return null;
    const m = u.match(
      /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return m ? m[1] : null;
  };
  const coverFor = (ep?: Episode | null): string => {
    const raw = ep?.thumbnail_media_id;
    if (looksLikeImage(raw)) return resolveMediaUrl(raw);
    const id = youTubeId(ep?.video_url);
    if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    return podcastCover || "";
  };

  // Spotlight ("Now playing") — a carousel of featured videos, admin-controlled.
  // The description is static (one for the section, not per video).
  const spotlightItems =
    (settings["podcast.spotlight_items"] as SpotlightItem[]) || [];
  const spotlightDescription =
    (settings["podcast.spotlight_description"] as string) || "";

  // Showcase section — admin-controlled video grid.
  const showcaseTitle = (settings["showcase.title"] as string) || "";
  const showcaseItems =
    (settings["showcase.items"] as ShowcaseItem[]) || [];
  const showcaseCover = resolveMediaUrl(settings["showcase.cover_url"] as string);

  // Newsletter section — admin-editable text + image.
  const newsletterImage = resolveMediaUrl(settings["newsletter.image_url"] as string);
  const newsletterSquareImage = resolveMediaUrl(settings["newsletter.square_image_url"] as string);
  const newsletterEyebrow = (settings["newsletter.eyebrow"] as string) || "";
  const newsletterHeading = (settings["newsletter.heading"] as string) || "";
  const newsletterItalic = (settings["newsletter.italic_accent"] as string) || "";
  const newsletterBody = (settings["newsletter.body"] as string) || "";
  const newsletterFootnote = (settings["newsletter.footnote"] as string) || "";

  // Events section — admin-editable heading + body
  const eventsHeading =
    (settings["events.heading"] as string) ||
    "In a <span class='italic-accent'>room,</span><br>together.";
  const eventsBody =
    (settings["events.body"] as string) ||
    "Charles teaches a small number of in-person retreats and lectures each year. Seats open here first.";

  // Book promo section — admin-editable image + text
  const bookPromoEnabled = (settings["book_promo.enabled"] as boolean) ?? true;
  const bookPromoImage1 = resolveMediaUrl(settings["book_promo.image_1_url"] as string);
  const bookPromoImage2 = resolveMediaUrl(settings["book_promo.image_2_url"] as string);
  const bookPromoImage3 = resolveMediaUrl(settings["book_promo.image_3_url"] as string);
  const bookPromoImages = [bookPromoImage1, bookPromoImage2, bookPromoImage3].filter(Boolean) as string[];
  const bookLightboxSrc = bookLightboxIndex !== null ? bookPromoImages[bookLightboxIndex] : null;
  const bookPromoTitleLine1 =
    (settings["book_promo.title_line1"] as string) || "A free book";
  const bookPromoTitleLine2 =
    (settings["book_promo.title_line2"] as string) || "for early birds";
  const bookPromoBody =
    (settings["book_promo.body"] as string) ||
    "Enter your email below and receive a free digital copy of the book on Christian Mindfulness, plus reserve an early bird seat for the next conversation.";
  const bookPromoCta =
    (settings["book_promo.cta_text"] as string) || "Get the free book & reserve a seat";

  const navLinks =
    (settings["nav.links"] as Array<{ label: string; href: string }>) || [];
  const socialLinks =
    (settings["footer.social_links"] as Array<{ platform: string; url: string }>) || [];

  return (
    <main>
      {/* ===================== HERO ===================== */}
      <section className="grid-pattern relative overflow-hidden pt-[160px] pb-[100px] min-h-[100dvh]">
        <div className="container-editorial">
          <div className="grid items-center gap-10 md:gap-[clamp(40px,5vw,80px)] md:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="eyebrow reveal in">{heroEyebrow}</span>
              <h1
                className="display mt-7 reveal in delay-1"
                style={{ fontSize: "clamp(40px, 6vw, 92px)", whiteSpace: "pre-wrap" }}
              >
                {heroTitle}
              </h1>
              <p className="display display-m italic-accent mt-4 reveal in delay-2">
                {heroSlogan}
              </p>
              <p className="lead mt-8 reveal in delay-2">{heroBody}</p>
            </div>
            <div className="photo-warm reveal in delay-2 aspect-[4/5] relative">
              <PortraitImage
                src={heroPortrait}
                alt={heroTitle}
                fallbackInitials="CL"
                noFallbackImage
                loading="eager"
              />
              {signatureUrl && (
                <img
                  src={signatureUrl}
                  alt={`${heroTitle} signature`}
                  className="hero-signature"
                  style={{
                    width: `${signatureWidth}px`,
                    bottom: `${signatureBottom}px`,
                    right: `${signatureRight}px`,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== BACKGROUND VIDEO ===================== */}
      {heroVideoUrl && <BackgroundVideoSection videoUrl={heroVideoUrl} />}

      {/* ===================== BANNER ===================== */}
      {heroBannerUrl && (
        <section className="w-full overflow-hidden">
          <Link
            to="/events/$id"
            params={{ id: "e6941a1e-3cb2-4846-be15-78e763fb923e" }}
            className="block"
          >
            <img
              src={heroBannerUrl}
              alt=""
              className="w-full max-w-full h-auto md:object-cover md:max-h-[640px]"
              loading="lazy"
            />
          </Link>
        </section>
      )}

      {/* ===================== MARQUEE ===================== */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span>
            {[...marqueeWords, ...marqueeWords].map((word, i) => (
              <span key={`${word}-${i}`} className="inline-flex items-center gap-[60px]">
                {word}
                <span className="marquee-dot" />
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* ===================== WELCOMING ===================== */}
      <section ref={welcomingSectionRef} id="welcoming" className="section-y">
        <div className="container-editorial">
          <div className="grid items-start gap-10 lg:gap-16 md:grid-cols-2">
            <ScrollReveal animation="scroll-reveal-up">
              <div ref={textColumnRef} className="flex flex-col welcoming-text welcoming-text--left">
                {welcomingEyebrow && (
                  <span className="eyebrow welcoming-eyebrow" style={{ whiteSpace: "pre-wrap" }}>{welcomingEyebrow}</span>
                )}
                {welcomingTitle && (
                  <h2 className="display mt-5 welcoming-title">
                    {welcomingTitle}
                  </h2>
                )}
                {welcomingBody && (
                  <p className="lead mt-6 welcoming-body" style={{ whiteSpace: "pre-wrap" }}>
                    {welcomingBody}
                  </p>
                )}
                {welcomingQuote && (
                  <p className="lead mt-4 welcoming-quote" style={{ whiteSpace: "pre-wrap" }}>
                    <em style={{ fontStyle: "italic" }}>{welcomingQuote}</em>
                  </p>
                )}
              </div>
            </ScrollReveal>
            {welcomingVideoUrl ? (
              <div ref={welcomingVideoRef} className="welcoming-video welcoming-video--sticky" style={{ minHeight: 0 }}>
                <InlineAutoplayVideo
                  url={welcomingVideoUrl}
                  cover={welcomingCover}
                  className="w-full h-full"
                  playing={welcomingVisible}
                />
              </div>
            ) : (
              <div ref={welcomingVideoRef} className="welcoming-video welcoming-video--sticky" aria-hidden="true" style={{ minHeight: 0 }}>
                <span className="welcoming-video__ph" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===================== ABOUT (dark) ===================== */}
      <section className="section-y section-dark">
        <div className="container-editorial">
          <ScrollReveal animation="scroll-reveal-up">
            <div className="section-header">
              <div className="left">
                <span className="eyebrow mb-5 inline-flex">{aboutEyebrow}</span>
                <h2 className="display mt-2" style={{ fontSize: "clamp(40px, 5.5vw, 72px)" }}>
                  {aboutHeading}
                </h2>
              </div>
              <div className="right">
                <p className="body-prose">{aboutBody}</p>
                <Link to="/about" className="btn-link mt-7">
                  Read the full story <span className="btn-arrow">→</span>
                </Link>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      <div className="section-divider" />

      {/* ===================== FEATURED BOOK ===================== */}
      <section className="section-y grid-pattern" style={{ background: "var(--paper-soft)" }}>
        <div className="container-editorial">
          <div className="grid items-center gap-[clamp(40px,6vw,100px)] md:[grid-template-columns:minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <ScrollReveal animation="scroll-reveal-up">
              <div
                className="photo-warm photo-book"
                style={{ boxShadow: "0 50px 80px -40px rgba(24,20,16,0.55)" }}
              >
                <PortraitImage
                  src={bookCover}
                  alt="From Death to Life — book cover"
                  fallbackInitials="FDtL"
                  noFallbackImage
                />
              </div>
            </ScrollReveal>
            <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
              <div>
                <span className="eyebrow">{bookEyebrow}</span>
                <h2
                  className="display mt-5"
                  style={{ fontSize: "clamp(44px, 6vw, 84px)" }}
                >
                  {bookHeading}
                  {bookHeadingAccent && (
                    <>
                      <br />
                      <span
                        className="italic-accent"
                        style={{ fontSize: "0.78em" }}
                      >
                        {bookHeadingAccent}
                      </span>
                    </>
                  )}
                </h2>
                <p className="lead mt-6">{bookLead}</p>
                <p className="body-prose mt-7">{bookBody}</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===================== PODCAST + SHOWCASE (dark) ===================== */}
      <section className="section-y section-dark">
        <div className="container-editorial">
          <ScrollReveal animation="scroll-reveal-up">
            <div className="mb-14">
              <h2 className="display mt-2" style={{ fontSize: "clamp(40px, 5.5vw, 72px)" }}>
                Marketplace <span className="italic-accent">conversations</span>
                <br />
                Biblical Mindfulness
              </h2>
            </div>
          </ScrollReveal>

          {spotlightItems.length > 0 && (
            <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
              <PodcastSpotlight
                items={spotlightItems}
                description={spotlightDescription}
                onPlay={(url) => requestPlay(url, setVideoUrl)}
                fallbackCover={podcastCover || ""}
              />
            </ScrollReveal>
          )}

          {showcaseItems.length > 0 && (
            <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
              <div className="mt-10">
                {showcaseTitle && (
                  <h3
                    className="display mb-8 text-center"
                    style={{ fontSize: "clamp(28px, 3.5vw, 48px)" }}
                  >
                    {showcaseTitle}
                  </h3>
                )}
                <ShowcaseSection
                  items={showcaseItems}
                  onPlay={(url) => requestPlay(url, setVideoUrl)}
                  onFindOutMore={async (item) => {
                    // Fast path: already flagged in localStorage
                    const key = `newsletter_subscribed_${user?.email || "anon"}`;
                    if (typeof window !== "undefined" && localStorage.getItem(key) === "1") {
                      requestPlay(item.video_url, setVideoUrl);
                      return;
                    }
                    // Check via API (requires login/session)
                    try {
                      const data = await apiFetch("/api/newsletter/me");
                      if (data?.subscribed) {
                        localStorage.setItem(key, "1");
                        requestPlay(item.video_url, setVideoUrl);
                        return;
                      }
                    } catch {
                      // ignore
                    }
                    // Not subscribed — open the gate
                    setActiveShowcaseItem(item);
                    setShowcaseGateOpen(true);
                  }}
                  fallbackCover={showcaseCover || ""}
                />
              </div>
            </ScrollReveal>
          )}

        </div>
      </section>

      {upcomingEvents.length > 0 && (
        <>
          <div className="section-divider" />

          {/* ===================== UPCOMING EVENTS ===================== */}
          <section className="section-y grid-pattern">
            <div className="container-editorial">
              <ScrollReveal animation="scroll-reveal-up">
                <div className="section-header">
                  <div className="left">
                    <span className="eyebrow mb-5 inline-flex">
                      Next up · {upcomingEvents.length} upcoming
                    </span>
                    <h2
                      className="display mt-2"
                      style={{ fontSize: "clamp(32px, 4.5vw, 56px)" }}
                      dangerouslySetInnerHTML={{ __html: eventsHeading }}
                    />
                  </div>
                  <div className="right">
                    <p className="body-prose">
                      {eventsBody}
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Featured event */}
              <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
                {(() => {
                  const featured = upcomingEvents[0];
                  const dt = new Date(featured.eventDate);
                  return (
                    <div className="featured-event group">
                      <Link
                        to="/events/$id"
                        params={{ id: featured.id }}
                        className="featured-event__media"
                      >
                        {featured.imageUrl ? (
                          <img
                            src={resolveMediaUrl(featured.imageUrl)}
                            alt={featured.title}
                          />
                        ) : (
                          <div
                            className="w-full h-full grid place-items-center"
                            style={{ background: "var(--paper-deep)" }}
                          />
                        )}
                        <div className="featured-event__date">
                          <span className="day">
                            {dt.toLocaleDateString("en-US", { day: "2-digit" })}
                          </span>
                          <span className="month">
                            {dt.toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="year numeric">{dt.getFullYear()}</span>
                        </div>
                        <span className="featured-event__chip">Featured</span>
                      </Link>

                      <div className="featured-event__content">
                        <Link
                          to="/events/$id"
                          params={{ id: featured.id }}
                          className="flex flex-col gap-5 min-w-0"
                        >
                          {featured.location && (
                            <span className="label-meta inline-flex items-center gap-2 flex-wrap break-words">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4"
                                aria-hidden="true"
                              >
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              {featured.location}
                            </span>
                          )}
                          <h3
                            className="display break-words"
                            style={{
                              fontSize: "clamp(28px, 3.4vw, 42px)",
                              lineHeight: 1.08,
                            }}
                          >
                            {featured.title}
                          </h3>
                          {featured.description && (
                            <p
                              className="body-prose break-words"
                              style={{ fontSize: 17 }}
                            >
                              {featured.description}
                            </p>
                          )}
                          <EventCountdown
                            targetDate={featured.eventDate}
                            size="compact"
                            hideSeconds={false}
                            className="mt-2"
                          />
                        </Link>

                      </div>
                    </div>
                  );
                })()}
              </ScrollReveal>

              {/* Free book promo — sits inside the Events section, below the featured event */}
              {bookPromoEnabled && featuredEvent && bookPromoImages.length > 0 && (
                <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
                  <div className="mt-10 md:mt-16 grid md:grid-cols-2 items-center gap-6 md:gap-10 lg:gap-14 min-w-0">
                    <div className="flex justify-center items-center min-w-0">
                      <div className="relative block max-w-[200px] w-full">
                        <button
                          type="button"
                          onClick={() => setBookLightboxIndex(0)}
                          className="book-promo-thumb focus:outline-none w-full"
                          aria-label={`Enlarge ${bookPromoTitleLine1} ${bookPromoTitleLine2} preview`}
                        >
                          <img
                            src={bookPromoImages[0]}
                            alt={`${bookPromoTitleLine1} ${bookPromoTitleLine2} cover`}
                            className="w-full h-auto max-w-full rounded-md shadow-lg"
                            loading="lazy"
                          />
                        </button>

                        {/* FREE BOOK banner sticker */}
                        <div
                          className="absolute -bottom-3 -right-3 bg-[var(--gold-primary)] text-white text-[11px] font-bold tracking-wider uppercase px-3 py-1.5 rounded shadow-lg"
                          style={{ transform: "rotate(-8deg)" }}
                        >
                          <span className="inline-flex items-center gap-1">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 12v10H4V12" />
                              <path d="M2 7h20v5H2z" />
                              <path d="M12 22V7" />
                              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                            </svg>
                            Free Book
                          </span>
                        </div>
                        <p className="absolute -bottom-9 right-0 text-[11px] text-[var(--ink-light)] italic whitespace-nowrap">
                          Click to see Contents
                        </p>
                      </div>
                    </div>
                    <div className="text-center md:text-left min-w-0 overflow-hidden">
                      <span className="eyebrow">GET A FREE BOOK</span>
                      <h3 className="display display-s mt-3 break-words">
                        <span className="block">{bookPromoTitleLine1}</span>
                        <span className="block">{bookPromoTitleLine2}</span>
                      </h3>
                      <p className="body-prose mt-4 max-w-xl break-words">{bookPromoBody}</p>
                      <button
                        type="button"
                        className="btn-ed btn-primary mt-5"
                        onClick={() => setRegisterModalOpen(true)}
                      >
                        {bookPromoCta} <span className="btn-arrow">→</span>
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              )}

              {/* Secondary grid — only when there are 2+ events */}
              {upcomingEvents.length > 1 && (
                <ScrollReveal animation="scroll-reveal-up" delay="delay-2">
                  <div className="grid md:grid-cols-2 gap-9 mt-14">
                    {upcomingEvents.slice(1, 5).map((ev) => {
                      const dt = new Date(ev.eventDate);
                      return (
                        <Link
                          key={ev.id}
                          to="/events/$id"
                          params={{ id: ev.id }}
                          className="block group"
                        >
                          <div className="photo-warm photo-wide mb-5 relative">
                            {ev.imageUrl ? (
                              <img
                                src={resolveMediaUrl(ev.imageUrl)}
                                alt={ev.title}
                              />
                            ) : (
                              <div
                                className="w-full h-full"
                                style={{ background: "var(--paper-deep)" }}
                              />
                            )}
                            <div className="event-card__small-date">
                              <span className="d">
                                {dt.toLocaleDateString("en-US", { day: "2-digit" })}
                              </span>
                              <span className="m">
                                {dt.toLocaleDateString("en-US", { month: "short" })}
                              </span>
                            </div>
                          </div>
                          <span className="label-meta">
                            {dt.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                            {ev.location ? ` · ${ev.location}` : ""}
                          </span>
                          <h3 className="display display-s mt-2.5">{ev.title}</h3>
                        </Link>
                      );
                    })}
                  </div>
                </ScrollReveal>
              )}


              <ScrollReveal animation="scroll-reveal-up" delay="delay-2">
                <div className="text-right mt-9">
                  <Link
                    to="/events/$id"
                    params={{ id: featuredEvent.id }}
                    className="btn-link"
                  >
                    Read more <span className="btn-arrow">→</span>
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </>
      )}

      <div className="section-divider" />

      {/* H.E.B.R.A.I.C. ZONES — copied from About page */}
      <section className="section-y" style={{ background: "var(--paper-soft)" }}>
        <div className="container-editorial">
          <ScrollReveal animation="scroll-reveal-up">
            <div className="section-header">
              <div className="left">
                <span className="eyebrow mb-5 inline-flex">
                  {(settings["about_page.zones_eyebrow"] as string) || "A framework, in seven"}
                </span>
                <h2 className="display mt-2" style={{ fontSize: "clamp(40px, 5.5vw, 72px)" }}>
                  {(settings["about_page.zones_heading_line1"] as string) || "THE"}
                  <br />
                  {(settings["about_page.zones_heading_line2"] as string) || "H.E.B.R.A.I.C."}
                  <span className="italic-accent">
                    {" "}
                    {(settings["about_page.zones_heading_accent"] as string) || "zones."}
                  </span>
                </h2>
              </div>
              <div className="right">
                <p className="body-prose">
                  {(settings["about_page.zones_description"] as string) ||
                    "Each zone is a small practice that goes beyond modern \"mindfulness\". It is deeply biblical, covenantal, relational and creates a consciousness that is rooted in the Hebrew Scriptures."}
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
            <div
              className="grid grid-cols-1 md:grid-cols-2"
              style={{ gap: 1, background: "var(--line)" }}
            >
              {getZones(settings).map((zone, i) => (
                <div
                  key={zone.code}
                  className={i === 6 ? "md:col-span-2" : ""}
                  style={{ background: "var(--paper-soft)", padding: 36 }}
                >
                  <span
                    className="numeric"
                    style={{ color: "var(--honey-deep)", fontSize: 14 }}
                  >
                    {zone.code}
                  </span>
                  <h3 className="display display-s mt-2.5">{zone.title}</h3>
                  <p className="body-prose mt-3" style={{ fontSize: 17 }}>
                    {zone.body}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-divider" />

      {/* ===================== NEWSLETTER ===================== */}
      <NewsletterSignup
        imageUrl={newsletterImage || undefined}
        squareImageUrl={newsletterSquareImage || undefined}
        eyebrow={newsletterEyebrow || undefined}
        heading={newsletterHeading || undefined}
        italicAccent={newsletterItalic || undefined}
        body={newsletterBody || undefined}
        footnote={newsletterFootnote || undefined}
      />

      {/* ===================== FOOTER ===================== */}
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
      <SubscribeGate
        open={registerGateOpen}
        onClose={() => {
          setRegisterGateCopy(defaultRegisterCopy);
          closeRegisterGate();
        }}
        onSubscribed={onRegisterSubscribed}
        defaultEmail={user?.email || ""}
        copy={registerGateCopy}
      />
      {featuredEvent && (
        <EventRegisterModal
          open={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          eventId={featuredEvent.id}
          eventTitle={featuredEvent.title}
          defaultEmail={user?.email || ""}
        />
      )}
      <SubscribeGate
        open={showcaseGateOpen}
        onClose={() => {
          setShowcaseGateOpen(false);
          setActiveShowcaseItem(null);
        }}
        onSubscribed={() => {
          // Mark as subscribed so future gates are skipped
          const key = `newsletter_subscribed_${user?.email || "anon"}`;
          if (typeof window !== "undefined") {
            localStorage.setItem(key, "1");
          }
          setShowcaseGateOpen(false);
          if (activeShowcaseItem?.video_url) {
            requestPlay(activeShowcaseItem.video_url, setVideoUrl);
          }
          setActiveShowcaseItem(null);
        }}
        defaultEmail={user?.email || ""}
        copy={
          activeShowcaseItem
            ? {
                eyebrow: activeShowcaseItem.title || "Watch this",
                title: (
                  <>
                    Subscribe to
                    <br />
                    <span className="italic-accent">unlock.</span>
                  </>
                ),
                description: (
                  <>
                    Enter your email below to join the newsletter and get instant
                    access to <strong>{activeShowcaseItem.title || "this video"}</strong> and every conversation.
                  </>
                ),
                successTitle: "You're in.",
                successDescription: (
                  <>
                    Welcome to the list — your video is opening now.
                  </>
                ),
                ctaText: "Send",
              }
            : undefined
        }
      />
      <WelcomingModal
        open={welcomingOpen}
        onClose={() => setWelcomingOpen(false)}
        videoUrl={welcomingVideoUrl}
        coverUrl={welcomingCover}
        eyebrow={welcomingEyebrow}
        title={welcomingTitle}
        body={welcomingBody}
        quote={welcomingQuote}
      />
      {bookLightboxSrc && (
        <div
          className="book-lightbox"
          onClick={() => setBookLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="book-lightbox__close"
            onClick={() => setBookLightboxIndex(null)}
            aria-label="Close preview"
          >
            ✕
          </button>

          <div
            className="relative inline-flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {bookPromoImages.length > 1 && bookLightboxIndex !== null && bookLightboxIndex > 0 && (
              <button
                type="button"
                className="book-lightbox__arrow book-lightbox__arrow--left"
                onClick={() =>
                  setBookLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))
                }
                aria-label="Previous preview"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}

            <img
              src={bookLightboxSrc}
              alt="Book preview"
              className="book-lightbox__img cursor-pointer"
              onClick={() =>
                setBookLightboxIndex((i) => {
                  const next = (i ?? 0) + 1;
                  return next >= bookPromoImages.length ? 0 : next;
                })
              }
            />

            {bookPromoImages.length > 1 && bookLightboxIndex !== null && bookLightboxIndex < bookPromoImages.length - 1 && (
              <button
                type="button"
                className="book-lightbox__arrow book-lightbox__arrow--right"
                onClick={() =>
                  setBookLightboxIndex((i) => Math.min(bookPromoImages.length - 1, (i ?? 0) + 1))
                }
                aria-label="Next preview"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Scroll-to-top floating button */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`scroll-to-top ${showScrollTop ? "scroll-to-top--visible" : ""}`}
        aria-label="Scroll to top"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </main>
  );
}

interface Zone {
  code: string;
  title: string;
  body: string;
}

const DEFAULT_ZONES: Zone[] = [
  { code: "01 · H", title: "HINENI", body: "\"Here I am\". A response to a divine call that is hardest of the seven. An expression of absolute surrender, deep humility and trust to listen and readiness to serve." },
  { code: "02 · E", title: "ETHICAL", body: "A consciousness in Hebrew thought that refers to discipline and active shaping of one's inner character and response to a higher moral authority." },
  { code: "03 · B", title: "BIBLICAL", body: "A reverent attentiveness to all scripture which is God-breathed and rooted in the Hebrew bible for learning, teaching in righteousness for every good work." },
  { code: "04 · R", title: "RELATIONAL", body: "In Hebrew thought relates to being \"set apart\" in relationship to God as Lord of all life." },
  { code: "05 · A", title: "AWARENESS", body: "In the present moment. In the 'Here & Now' that God is eternally present in time." },
  { code: "06 · I", title: "INHABIT", body: "How to inhabit time? Finding hope in the future by reconciling with the past and trusting God's redemptive presence in the here and now." },
  { code: "07 · C", title: "COVENANT", body: "The foundation of the Hebrew scriptures is the covenantal relationship and bond between God and humanity. The core essence of covenant is expressed in the phrase: \"I will be your God, and you will be My people.\"" },
];

function getZones(src: Record<string, unknown>): Zone[] {
  const val = src["about_page.zones"];
  if (Array.isArray(val) && val.length > 0) return val as Zone[];
  return DEFAULT_ZONES;
}
