import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-transparent px-5 py-1.5 text-xs font-normal tracking-normal lowercase first-letter:uppercase",
  {
    variants: {
      variant: {
        // Primary purple background with dark text
        default: "bg-primary-100 text-secondary dark:bg-accent/10 dark:text-accent",

        // Dark background with white text, medium font weight
        secondary: "bg-secondary text-white font-medium",

        // Destructive red accent
        destructive: "bg-[var(--ns-red)] text-secondary",

        // Outline style with border
        outline: "border border-stroke-3 dark:border-stroke-7 text-secondary dark:text-accent bg-transparent",

        // Brand accent colors
        green: "bg-[var(--ns-green-light)] text-secondary",
        yellow: "bg-[var(--ns-yellow-light)] text-secondary",
        cyan: "bg-[var(--ns-cyan-light)] text-secondary",

        // Gray variants
        gray: "bg-accent/40 text-secondary dark:bg-secondary/40 dark:text-accent",
        "gray-light": "bg-background-3 text-secondary/60 dark:bg-background-7 dark:text-accent/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
