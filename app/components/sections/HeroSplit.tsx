import { useEffect, useState } from "react";

interface Props {
  title: string;
  slogan: string;
  authorImageUrl: string | null;
  authorImageVerticalOffset?: number;
  authorImageObjectPosition?: string;
  signatureUrl?: string | null;
  signatureWidth?: number;
  signatureBottom?: number;
  signatureRight?: number;
  navLinks: Array<{ label: string; href: string }>;
  titleFontFamily?: string;
  titleFontSize?: number;
  titleBold?: boolean;
  titleItalic?: boolean;
  titleColor?: string;
  titleShadow?: boolean;
  titleFirstLetterStyle?: "none" | "drop_cap";
  subtitle?: string;
  body?: string;
  ctaText?: string;
  ctaHref?: string;
}

const DEFAULT_HERO_TITLE = {
  fontFamily: "Playfair Display",
  fontSize: 64,
  bold: true,
  italic: false,
  color: "#3A2518",
  shadow: false,
  firstLetterStyle: "none" as "none" | "drop_cap",
};

function buildGoogleFontHref(fontFamily: string): string {
  const family = fontFamily.trim().replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${family}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
}

export function HeroSplit({
  title,
  slogan,
  authorImageUrl,
  authorImageVerticalOffset = 0,
  authorImageObjectPosition = "center 52%",
  signatureUrl,
  signatureWidth = 220,
  signatureBottom = 80,
  signatureRight = 24,
  titleFontFamily,
  titleFontSize,
  titleBold,
  titleItalic,
  titleColor,
  titleShadow,
  titleFirstLetterStyle,
  subtitle,
  body,
}: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const showAuthorImage = Boolean(authorImageUrl) && !imageFailed;
  const fontFamily = titleFontFamily || DEFAULT_HERO_TITLE.fontFamily;
  const fontSize = titleFontSize || DEFAULT_HERO_TITLE.fontSize;
  const isBold = titleBold ?? DEFAULT_HERO_TITLE.bold;
  const isItalic = titleItalic ?? DEFAULT_HERO_TITLE.italic;
  const configuredColor = titleColor || DEFAULT_HERO_TITLE.color;
  const color = configuredColor.toLowerCase() === "#f8e7bf" ? "#4b3218" : configuredColor;
  const shadow = titleShadow ?? DEFAULT_HERO_TITLE.shadow;
  const firstLetterStyle = titleFirstLetterStyle || DEFAULT_HERO_TITLE.firstLetterStyle;
  const firstLetter = title.charAt(0);
  const titleRemainder = title.slice(1);

  useEffect(() => {
    const href = buildGoogleFontHref(fontFamily);
    const existing = document.querySelector(`link[data-hero-font="${fontFamily}"]`);
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.setAttribute("data-hero-font", fontFamily);
      document.head.appendChild(link);
    }
  }, [fontFamily]);

  useEffect(() => {
    setImageFailed(false);
  }, [authorImageUrl]);

  return (
    <section className="relative text-brown-dark reveal-scale overflow-hidden bg-[#f7edcf]">
      <div className="relative grid md:grid-cols-[0.95fr_1.05fr] min-h-[72dvh] md:min-h-[calc(92dvh_-_64px)]">
        <div className="flex flex-col justify-center items-start px-7 py-14 sm:px-10 md:px-14 lg:px-20 md:py-16 text-left bg-[linear-gradient(115deg,#fbf2d9_0%,#f1e1ba_100%)] reveal-up order-2 md:order-1">
          {subtitle && <p className="ui-label text-brown-dark/60 mb-6">{subtitle}</p>}

          <h1
            className="mb-6 leading-[0.95] font-serif"
            style={{
              fontFamily: `'${fontFamily}', serif`,
              fontSize: `clamp(40px, 6vw, ${fontSize}px)`,
              fontWeight: isBold ? 700 : 400,
              fontStyle: isItalic ? "italic" : "normal",
              color,
              textShadow: shadow ? "0 3px 12px rgba(91,68,30,0.18)" : "none",
            }}
          >
            {firstLetterStyle === "drop_cap" && firstLetter ? (
              <>
                <span
                  style={{
                    fontSize: "1.35em",
                    lineHeight: 0.8,
                    display: "inline-block",
                    marginRight: "0.04em",
                    verticalAlign: "baseline",
                  }}
                >
                  {firstLetter}
                </span>
                {titleRemainder}
              </>
            ) : (
              title
            )}
          </h1>

          <div className="gold-separator mb-6" />

          {slogan && <p className="text-xl md:text-2xl text-brown-dark/72 leading-relaxed max-w-md mb-4 italic font-serif">{slogan}</p>}

          <p className="text-lg md:text-xl text-brown-dark/86 leading-relaxed max-w-[58ch] font-serif">{body}</p>
        </div>

        <div className="relative min-h-[58dvh] md:min-h-0 order-1 md:order-2 overflow-hidden bg-[linear-gradient(135deg,#3a260c_0%,#6d4d18_44%,#f0d99d_100%)]">
          <div className="absolute inset-x-8 top-8 h-px bg-[#f6dda0]/55" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(43,27,6,0.18)_0%,rgba(255,236,184,0.2)_100%)] pointer-events-none" />
          {showAuthorImage ? (
            <div className="absolute inset-0">
              <img
                src={authorImageUrl || undefined}
                alt="Author"
                className="absolute bottom-0 left-1/2 z-[1] h-[96%] w-auto max-w-none -translate-x-1/2 object-contain drop-shadow-[0_28px_38px_rgba(21,13,3,0.38)]"
                style={{ objectPosition: authorImageObjectPosition }}
                onError={() => setImageFailed(true)}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="w-full max-w-md rounded-[2rem] bg-[#f8ecd1] border border-[#c79b3a]/35 p-4 shadow-[0_24px_60px_rgba(90,62,13,0.18)]">
                <div className="rounded-[1.5rem] border border-[#7a5a1d]/25 bg-gradient-to-br from-[#ead09a] to-[#c6952b] min-h-[390px] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 ui-label text-[#5d4315] bg-[#fff5dd]/80 px-3 py-1 rounded-full border border-[#7a5a1d]/20">
                    Author Visual
                  </div>
                  <div className="w-44 h-44 rounded-full border border-[#7a5a1d]/30 bg-[#fff5dd]/85 flex items-center justify-center shadow-xl shadow-[#6a4d17]/20">
                    <svg className="w-24 h-24 text-[#6c4f1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A7.97 7.97 0 0112 14c2.417 0 4.584 1.07 6.045 2.758M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    </svg>
                  </div>
                  <p className="ui-label mt-6 text-[#5d4315]">Author Image Missing</p>
                  <p className="text-sm text-[#6c4f1a]/80 mt-2 px-4 text-center">
                    Add a portrait in <span className="font-semibold">hero.author_image_url</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
          {signatureUrl && (
            <img
              src={signatureUrl || undefined}
              alt="Signature"
              className="absolute z-[2] object-contain pointer-events-none hidden md:block"
              style={{
                width: `${signatureWidth}px`,
                maxWidth: "40%",
                height: "auto",
                bottom: `${signatureBottom + authorImageVerticalOffset}px`,
                right: `${signatureRight}px`,
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
