import type { ReactNode } from "react";
import { cn } from "cn";

const RADIUS = 50;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ProgressRingProps {
  value: number;
  max: number;
  label: ReactNode;
  caption: ReactNode;
  ariaLabel: string;
  tone?: "default" | "alert";
  className?: string;
}

export function ProgressRing({
  value,
  max,
  label,
  caption,
  ariaLabel,
  tone = "default",
  className,
}: ProgressRingProps) {
  const filled = (Math.min(Math.max(value, 0), max) / max) * CIRCUMFERENCE;
  const alert = tone === "alert";
  return (
    <div role="img" aria-label={ariaLabel} className={cn("relative size-30 shrink-0", className)}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="12"
          className={alert ? "stroke-overstay" : "stroke-ring-track"}
        />
        {!alert && (
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
            className="stroke-primary"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl leading-none font-bold", alert && "text-overstay")}>
          {label}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">{caption}</span>
      </div>
    </div>
  );
}
