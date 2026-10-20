import type { ComponentProps } from "react";
import { cn } from "cn";

export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("text-xs font-semibold tracking-wider text-muted-foreground uppercase", className)}
      {...props}
    />
  );
}
