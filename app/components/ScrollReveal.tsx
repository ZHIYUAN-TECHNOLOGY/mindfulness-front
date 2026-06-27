import type { ElementType, ReactNode } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface Props {
  children: ReactNode;
  className?: string;
  animation?: "scroll-reveal-up" | "scroll-reveal-in" | "scroll-reveal-zoom" | "scroll-reveal-left" | "scroll-reveal-right";
  delay?: "delay-1" | "delay-2" | "delay-3" | "delay-4";
  as?: ElementType;
}

export function ScrollReveal({
  children,
  className = "",
  animation = "scroll-reveal-up",
  delay,
  as: Tag = "div",
}: Props) {
  const { ref, isVisible } = useScrollReveal();
  const classes = [className, animation, delay, isVisible ? "is-visible" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag ref={ref as any} className={classes}>
      {children}
    </Tag>
  );
}
