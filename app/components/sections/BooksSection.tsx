interface Props {
  heading: string;
  title: string;
  description: string;
  coverUrl: string | null;
  coverWidth?: number;
  coverHeight?: number;
}

export function BooksSection({
  heading,
  title,
  description,
  coverUrl,
  coverWidth = 320,
  coverHeight = 460,
}: Props) {
  return (
    <section id="memoir" className="relative overflow-hidden bg-[#efddb2] text-brown-dark reveal-in">
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
        <div className="order-2 flex items-center justify-center reveal-zoom md:order-1">
          <div className="relative w-full max-w-[620px] bg-[#4b3218] p-5 shadow-[0_34px_74px_rgba(58,36,8,0.3)]">
            <div className="absolute -left-4 -top-4 h-24 w-24 border-l border-t border-[#dfbd72]" />
            <div className="absolute -bottom-4 -right-4 h-24 w-24 border-b border-r border-[#dfbd72]" />
            <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#6a4511_0%,#9c6d1d_45%,#e0bd72_100%)]">
              <div className="absolute left-8 top-8 h-px w-40 bg-[#f5dda0]/60" />
              <div className="absolute bottom-9 right-8 h-px w-56 bg-[#4b3218]/30" />
              <div className="absolute inset-x-16 bottom-20 h-12 bg-[#3a260c]/20 blur-xl" />
              {coverUrl ? (
                <div className="card-hover-lift relative -translate-y-3">
                  <div className="absolute -inset-5 bg-[#f3d995]/16 blur-sm" />
                  <img
                    src={coverUrl}
                    alt={title}
                    className="relative object-cover shadow-[18px_22px_34px_rgba(34,22,7,0.32)]"
                    style={{ width: `${coverWidth}px`, maxWidth: "100%", aspectRatio: `${coverWidth} / ${coverHeight}`, height: "auto" }}
                  />
                </div>
              ) : (
                <div className="flex h-64 w-48 items-center justify-center border border-[#d2aa58]/50 bg-[#f8ecd1]/75 text-[#6f5120]">Book Cover</div>
              )}
            </div>
          </div>
        </div>
        <div className="order-1 reveal-up md:order-2 md:pl-8">
          <span className="mb-6 inline-flex border border-[#9b6b1d]/25 bg-[#4b3218] px-4 py-2 ui-label text-[#f6df9f]">
            The Book
          </span>
          <h2 className="font-serif text-5xl font-semibold leading-none text-[#352313] md:text-6xl">
            {heading}
          </h2>
          <div className="my-7 h-px w-28 bg-[#b8872d]" />
          <h3 className="mb-5 max-w-[13ch] font-serif text-4xl font-medium leading-tight text-[#4a2f1c] md:text-5xl">
            {title}
          </h3>
          <p className="max-w-[56ch] whitespace-pre-line font-serif text-xl leading-relaxed text-[#4f3a28]">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
