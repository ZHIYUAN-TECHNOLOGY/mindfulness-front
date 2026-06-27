import { useEffect, useRef } from "react";

export function BackgroundBlobs() {
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const l1 = layer1Ref.current;
    const l2 = layer2Ref.current;
    const l3 = layer3Ref.current;
    if (!l1 || !l2 || !l3) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        // Only horizontal drift — no vertical shift so hard edges never scroll into view
        l1.style.transform = `translate3d(${y * 0.04}px, 0, 0)`;
        l2.style.transform = `translate3d(${y * -0.07}px, 0, 0)`;
        l3.style.transform = `translate3d(${y * 0.10}px, 0, 0)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, overflow: "hidden" }}
    >
      {/* Base gradient layer */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 30%, rgba(179,124,16,0.28) 0%, transparent 70%),
            radial-gradient(ellipse 60% 80% at 80% 70%, rgba(140,96,12,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,230,179,0.18) 0%, transparent 70%)
          `,
        }}
      />

      {/* Parallax Layer 1 — extra wide, clipped by overflow:hidden */}
      <div
        ref={layer1Ref}
        className="absolute top-0 will-change-transform"
        style={{
          transition: "transform 0.1s linear",
          width: "160%",
          left: "-30%",
          height: "100%",
        }}
      >
        <svg
          viewBox="0 0 1440 2400"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          style={{ filter: "blur(0px)", opacity: 0.75 }}
        >
          <defs>
            <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B37C10" stopOpacity="0.60" />
              <stop offset="50%" stopColor="#D4A03A" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#5C3D05" stopOpacity="0.50" />
            </linearGradient>
            <linearGradient id="goldGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F2C94C" stopOpacity="0.40" />
              <stop offset="60%" stopColor="#B37C10" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#5C3D05" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id="lightGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FFE6B3" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#B37C10" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="darkGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#5C3D05" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1A0F02" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          {/* Top floating organic blob — no straight edges */}
          <path
            fill="url(#goldGrad1)"
            d="M-200,200 Q200,-100 600,100 Q1000,300 1400,100 Q1700,-100 1640,300 Q1500,600 1100,500 Q700,400 300,500 Q-100,600 -200,200 Z"
          />

          {/* Mid-left sweeping blob */}
          <path
            fill="url(#goldGrad2)"
            d="M-300,600 Q100,500 300,800 Q500,1100 200,1300 Q-100,1500 -300,1200 Z"
          />

          {/* Right-side elegant blob */}
          <path
            fill="url(#goldGrad1)"
            d="M1400,200 Q1600,500 1500,900 Q1400,1300 1600,1600 Q1800,1900 1400,2100 Q1200,1800 1300,1400 Q1400,1000 1200,700 Q1100,400 1400,200 Z"
          />

          {/* Mid cream accent blob */}
          <path
            fill="url(#lightGrad)"
            d="M-200,850 Q200,700 500,950 Q800,1200 1100,1000 Q1400,800 1640,950 Q1500,1200 1200,1300 Q900,1400 600,1250 Q300,1100 -200,1250 Z"
          />

          {/* Bottom dark blob — no straight bottom edge */}
          <path
            fill="url(#darkGrad)"
            d="M-200,1700 Q400,1500 800,1800 Q1200,2100 1640,1900 Q1800,2200 1400,2400 Q1000,2600 600,2400 Q200,2200 -200,2400 Z"
          />

          {/* Geometric accents */}
          <polygon
            fill="#D4A03A"
            fillOpacity="0.28"
            points="720,350 780,420 720,490 660,420"
          />
          <polygon
            fill="#B37C10"
            fillOpacity="0.22"
            points="1100,900 1160,980 1100,1060 1040,980"
          />
          <polygon
            fill="#F2C94C"
            fillOpacity="0.18"
            points="300,1700 340,1740 300,1780 260,1740"
          />

          <circle cx="200" cy="1000" r="180" fill="#FFE6B3" fillOpacity="0.12" />
          <circle cx="1200" cy="1900" r="250" fill="#B37C10" fillOpacity="0.10" />
          <circle cx="1100" cy="300" r="120" fill="#F2C94C" fillOpacity="0.10" />
        </svg>
      </div>

      {/* Parallax Layer 2 */}
      <div
        ref={layer2Ref}
        className="absolute top-0 will-change-transform"
        style={{
          transition: "transform 0.1s linear",
          width: "160%",
          left: "-30%",
          height: "100%",
        }}
      >
        <svg
          viewBox="0 0 1440 2400"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          style={{ opacity: 0.35 }}
        >
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B37C10" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#F2C94C" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="waveGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFE6B3" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#5C3D05" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Upper soft wave blob */}
          <path
            fill="url(#waveGrad1)"
            d="M-200,200 Q160,100 520,250 Q880,400 1240,200 Q1500,100 1640,250 Q1500,500 1100,450 Q700,400 300,500 Q-100,600 -200,200 Z"
          />

          {/* Lower-right soft arc blob */}
          <path
            fill="url(#waveGrad2)"
            d="M1240,1400 Q1000,1500 800,1700 Q600,1900 800,2100 Q1000,2300 1240,2200 Q1400,2100 1500,1900 Q1400,1700 1240,1400 Z"
          />

          <ellipse
            cx="720"
            cy="1200"
            rx="400"
            ry="200"
            fill="#D4A03A"
            fillOpacity="0.08"
          />

          <polygon
            fill="#F2C94C"
            fillOpacity="0.12"
            points="400,600 440,640 400,680 360,640"
          />
          <polygon
            fill="#FFE6B3"
            fillOpacity="0.10"
            points="1000,1500 1050,1560 1000,1620 950,1560"
          />
        </svg>
      </div>

      {/* Parallax Layer 3 — flowing stroke lines */}
      <div
        ref={layer3Ref}
        className="absolute top-0 will-change-transform"
        style={{
          transition: "transform 0.1s linear",
          width: "160%",
          left: "-30%",
          height: "100%",
        }}
      >
        <svg
          viewBox="0 0 1440 2400"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          style={{ opacity: 0.45 }}
        >
          {/* Continuous flowing curves — each loops beyond viewport so no endpoint visible */}
          <path
            fill="none"
            stroke="#B37C10"
            strokeWidth="1.5"
            strokeOpacity="0.15"
            strokeLinecap="round"
            d="M-200,300 Q0,200 200,350 Q400,500 600,350 Q800,200 1000,300 Q1200,400 1400,300 Q1600,200 1640,350"
          />
          <path
            fill="none"
            stroke="#D4A03A"
            strokeWidth="2"
            strokeOpacity="0.12"
            strokeLinecap="round"
            d="M-200,700 Q100,600 400,750 Q700,900 1000,750 Q1300,600 1640,750"
          />
          <path
            fill="none"
            stroke="#F2C94C"
            strokeWidth="1"
            strokeOpacity="0.18"
            strokeLinecap="round"
            d="M-200,1100 Q50,1000 300,1150 Q550,1300 800,1150 Q1050,1000 1400,1150 Q1600,1250 1640,1100"
          />
          <path
            fill="none"
            stroke="#5C3D05"
            strokeWidth="2.5"
            strokeOpacity="0.10"
            strokeLinecap="round"
            d="M-200,1600 Q150,1450 500,1650 Q850,1850 1200,1650 Q1500,1500 1640,1650"
          />

          {/* Scattered small circles */}
          <circle cx="150" cy="500" r="60" fill="#FFE6B3" fillOpacity="0.08" />
          <circle cx="1300" cy="800" r="80" fill="#B37C10" fillOpacity="0.06" />
          <circle cx="600" cy="1800" r="100" fill="#F2C94C" fillOpacity="0.07" />
          <circle cx="1100" cy="2000" r="50" fill="#D4A03A" fillOpacity="0.09" />
        </svg>
      </div>

      {/* Fine grain noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />
    </div>
  );
}
