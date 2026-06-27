interface Props {
  from?: string;
  to?: string;
}

export function FooterWaveTransition({ from = "#f5e8c8", to = "#4b3218" }: Props) {
  return (
    <div className="relative -mt-px h-48 overflow-hidden" style={{ background: from }} aria-hidden="true">
      <svg viewBox="0 0 1440 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          {/* Vertical fill: newsletter color at top, fading to footer color */}
          <linearGradient id="footer-wave-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="45%" stopColor={from} />
            <stop offset="75%" stopColor="#8a5e1a" />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          {/* Horizontal ribbon gradient: dark brown to gold to dark brown */}
          <linearGradient id="footer-wave-ribbon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4b3218" stopOpacity="0.92" />
            <stop offset="35%" stopColor="#6f4a15" stopOpacity="0.96" />
            <stop offset="68%" stopColor="#a67625" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#4b3218" stopOpacity="0.94" />
          </linearGradient>
          {/* Highlight stroke on ribbon top edge */}
          <linearGradient id="footer-wave-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f4d58e" stopOpacity="0" />
            <stop offset="40%" stopColor="#f4d58e" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f4d58e" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Full-area background fill */}
        <rect width="1440" height="300" fill="url(#footer-wave-fill)" />
        {/* Thick flowing ribbon */}
        <path
          d="M0 130 C200 60 320 200 480 110 C640 20 800 180 960 90 C1120 0 1280 160 1440 80 L1440 190 C1280 270 1120 110 960 200 C800 290 640 130 480 220 C320 310 200 170 0 240 Z"
          fill="url(#footer-wave-ribbon)"
        />
        {/* Highlight line on ribbon top */}
        <path
          d="M0 130 C200 60 320 200 480 110 C640 20 800 180 960 90 C1120 0 1280 160 1440 80"
          fill="none"
          stroke="url(#footer-wave-line)"
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
}
