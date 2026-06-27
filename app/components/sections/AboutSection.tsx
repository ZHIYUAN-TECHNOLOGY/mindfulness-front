import { resolveMediaUrl } from "../../lib/media";

interface Props {
  heading: string;
  subheading: string;
  body: string;
  mediaUrl: string | null;
  ctaText: string;
  ctaUrl: string;
  mediaWidth?: number;
  mediaHeight?: number;
}

export function AboutSection({
  heading,
  subheading,
  body,
  mediaUrl,
  mediaWidth = 520,
  mediaHeight = 560,
}: Props) {
  return (
    <section id="about" className="relative overflow-hidden bg-[#f6ecd1] text-brown-dark reveal-in">
      <div className="absolute inset-x-0 top-0 h-px bg-[#c79b3a]/30" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[0.85fr_1.05fr] lg:px-8 lg:py-28">
        <div className="relative reveal-up">
          <span className="mb-6 inline-flex border border-[#9b6b1d]/25 bg-[#4b3218] px-4 py-2 ui-label text-[#f6df9f]">
            {subheading}
          </span>
          <h2 className="max-w-[11ch] font-serif text-5xl font-semibold leading-[0.98] text-[#352313] md:text-6xl">
            {heading}
          </h2>
          <div className="my-7 h-px w-28 bg-[#b8872d]" />
          <p className="max-w-[58ch] whitespace-pre-line font-serif text-xl leading-relaxed text-[#4f3a28]">
            {body}
          </p>
        </div>
        <div className="relative reveal-zoom delay-1">
          <div className="absolute -left-5 top-8 hidden h-[84%] w-16 bg-[#4b3218] md:block" />
          <div className="relative border border-[#b6862d]/35 bg-[linear-gradient(135deg,#4b3218_0%,#7a5317_38%,#d9b56b_100%)] p-4 shadow-[0_34px_70px_rgba(64,39,8,0.28)]">
          {mediaUrl ? (
            mediaUrl.endsWith(".mp4") || mediaUrl.endsWith(".webm") ? (
              <video controls className="block object-cover shadow-xl" style={{ width: `${mediaWidth}px`, maxWidth: "100%", aspectRatio: `${mediaWidth} / ${mediaHeight}`, height: "auto" }}>
                <source src={resolveMediaUrl(mediaUrl)} />
              </video>
            ) : (
              <img src={resolveMediaUrl(mediaUrl)} alt={heading} className="block object-cover shadow-xl" style={{ width: `${mediaWidth}px`, maxWidth: "100%", aspectRatio: `${mediaWidth} / ${mediaHeight}`, height: "auto" }} />
            )
          ) : (
            <div className="flex h-64 w-full items-center justify-center border border-[#e2c07f]/45 bg-[#f8ecd1]/75 text-[#6f5120]">Media Placeholder</div>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}
