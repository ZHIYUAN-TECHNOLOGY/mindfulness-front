import { useEffect, useState } from "react";

interface Props {
  targetDate: string | Date;
  /** Visual scale — "compact" for cards, "large" for hero treatments. */
  size?: "compact" | "large";
  /** Hide the seconds slot when true (calmer at-a-glance read). */
  hideSeconds?: boolean;
  className?: string;
}

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function diff(target: number): Remaining {
  const ms = target - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, done: false };
}

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

export function EventCountdown({
  targetDate,
  size = "compact",
  hideSeconds = false,
  className = "",
}: Props) {
  const target =
    typeof targetDate === "string"
      ? new Date(targetDate).getTime()
      : targetDate.getTime();
  const [remaining, setRemaining] = useState<Remaining>(() => diff(target));

  useEffect(() => {
    if (Number.isNaN(target)) return;
    setRemaining(diff(target));
    if (remaining.done) return;
    const id = window.setInterval(() => {
      setRemaining(diff(target));
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  if (Number.isNaN(target) || remaining.done) return null;

  const numClass =
    size === "large"
      ? "numeric text-ink text-[clamp(28px,3.4vw,40px)] leading-none"
      : "numeric text-ink text-[18px] leading-none";
  const labelClass = "label-meta mt-1.5";

  const cells: Array<[number, string]> = [
    [remaining.days, "days"],
    [remaining.hours, "hrs"],
    [remaining.minutes, "min"],
  ];
  if (!hideSeconds) cells.push([remaining.seconds, "sec"]);

  return (
    <div
      className={`flex flex-wrap items-stretch ${className}`}
      style={{
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
      role="timer"
      aria-label="Countdown to event"
    >
      {cells.map(([value, label], idx) => (
        <div
          key={label}
          className="flex flex-col items-center px-3 sm:px-4 py-2.5 sm:py-3"
          style={{
            // Hairline divider between adjacent cells on the same row.
            // The first cell never gets one; wrapped rows reuse the
            // container's top border for visual continuity.
            borderLeft: idx === 0 ? "none" : "1px solid var(--line)",
            minWidth: "64px",
          }}
        >
          <span className={numClass}>{pad(value)}</span>
          <span className={labelClass}>{label}</span>
        </div>
      ))}
    </div>
  );
}
