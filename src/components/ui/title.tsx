import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const titleVariants = cva("leading-tight font-bold", {
  variants: {
    size: {
      lg: "text-2xl",
      md: "text-lg",
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

type TitleProps = ComponentProps<"p"> &
  VariantProps<typeof titleVariants> & {
    as?: "p" | "h1" | "h2";
  };

export function Title({ as: Tag = "p", size, className, ...props }: TitleProps) {
  return <Tag className={cn(titleVariants({ size }), className)} {...props} />;
}
