export function NewsletterTransition() {
  return (
    <div className="relative h-32 overflow-hidden bg-[#f4e6c3]" aria-hidden="true">
      <svg viewBox="0 0 1440 190" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="newsletter-transition-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4e6c3" />
            <stop offset="100%" stopColor="#ead6a4" />
          </linearGradient>
          <linearGradient id="newsletter-transition-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8f641d" stopOpacity="0" />
            <stop offset="50%" stopColor="#9f6b16" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#8f641d" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1440" height="190" fill="#f4e6c3" />
        <path
          d="M0 74 C150 118 298 28 462 78 C646 134 758 142 920 84 C1100 18 1256 96 1440 52 L1440 190 L0 190 Z"
          fill="url(#newsletter-transition-fill)"
        />
        <path
          d="M0 73 C150 117 298 27 462 77 C646 133 758 141 920 83 C1100 17 1256 95 1440 51"
          fill="none"
          stroke="url(#newsletter-transition-line)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
