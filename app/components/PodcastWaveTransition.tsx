interface Props {
  from?: string;
  to?: string;
}

export function PodcastWaveTransition({ from = "#efddb2", to = "#f4e6c3" }: Props) {
  return (
    <div className="relative h-40 overflow-hidden" style={{ background: from }} aria-hidden="true">
      <svg viewBox="0 0 1440 260" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="podcast-wave-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="72%" stopColor={to} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          <linearGradient id="podcast-wave-ribbon" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4b3218" stopOpacity="0.92" />
            <stop offset="34%" stopColor="#6f4a15" stopOpacity="0.96" />
            <stop offset="68%" stopColor="#a67625" stopOpacity="0.86" />
            <stop offset="100%" stopColor="#4b3218" stopOpacity="0.94" />
          </linearGradient>
          <linearGradient id="podcast-wave-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f4d58e" stopOpacity="0" />
            <stop offset="45%" stopColor="#f4d58e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f4d58e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="1440" height="260" fill="url(#podcast-wave-fill)" />
        <path
          d="M0 82 C155 22 250 150 398 116 C560 78 654 18 812 58 C974 99 1050 178 1215 144 C1316 123 1364 80 1440 92 L1440 164 C1314 138 1265 214 1138 202 C966 185 900 88 740 92 C604 96 548 190 390 194 C238 198 165 88 0 160 Z"
          fill="url(#podcast-wave-ribbon)"
        />
        <path
          d="M0 80 C155 20 250 148 398 114 C560 76 654 16 812 56 C974 97 1050 176 1215 142 C1316 121 1364 78 1440 90"
          fill="none"
          stroke="url(#podcast-wave-line)"
          strokeWidth="2"
        />
      </svg>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.14]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='32' height='64' viewBox='0 0 32 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 28h20V16h-4v8H4V4h28v28h-4V8H8v12h4v-8h12v20H0v-4zm12 8h20v4H16v24H0v-4h12V36zm16 12h-4v12h8v4H20V44h12v12h-4v-8zM0 36h8v20H0v-4h4V40H0v-4z' fill='%23b07810' fill-opacity='0.12' fill-rule='evenodd'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
