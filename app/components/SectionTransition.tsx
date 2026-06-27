interface Props {
  flip?: boolean;
  from?: string;
  to?: string;
}

export function SectionTransition({ flip = false, from = "#f6ecd1", to = "#efddb2" }: Props) {
  return (
    <div
      className={`relative h-28 overflow-hidden ${flip ? "rotate-180" : ""}`}
      style={{ background: from }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1440 180" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="section-transition-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          <linearGradient id="section-transition-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8f641d" stopOpacity="0" />
            <stop offset="35%" stopColor="#b8872d" stopOpacity="0.42" />
            <stop offset="70%" stopColor="#f4d58e" stopOpacity="0.36" />
            <stop offset="100%" stopColor="#8f641d" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 104 C170 168 340 40 545 94 C760 150 890 172 1068 78 C1215 0 1280 142 1440 82 L1440 180 L0 180 Z"
          fill="url(#section-transition-fill)"
        />
        <path
          d="M0 103 C170 167 340 39 545 93 C760 149 890 171 1068 77 C1215 -1 1280 141 1440 81"
          fill="none"
          stroke="url(#section-transition-stroke)"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
