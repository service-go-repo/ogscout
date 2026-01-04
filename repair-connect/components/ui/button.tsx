import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-normal transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary purple button with border
        default: "bg-primary-500 text-white border border-primary-600 shadow-sm hover:bg-primary-600 hover:shadow-md active:bg-primary-700",

        // Gradient purple-to-pink button (for hero CTAs)
        gradient: "bg-gradient-1 text-white border-0 shadow-md hover:shadow-lg",

        // Dark secondary button
        secondary: "bg-secondary text-white border border-black shadow-sm hover:bg-secondary/90",

        // Outline button with transparent background
        outline: "border-2 border-stroke-3 dark:border-stroke-7 bg-transparent text-secondary dark:text-accent hover:bg-background-3 dark:hover:bg-background-7",

        // Ghost button (no background)
        ghost: "hover:bg-background-3 dark:hover:bg-background-7 text-secondary dark:text-accent",

        // White button for dark backgrounds
        white: "bg-background-1 text-secondary border border-stroke-3 shadow-sm hover:bg-background-2",

        // Destructive red button
        destructive: "bg-[var(--ns-red)] text-secondary hover:bg-[var(--ns-red)]/90 shadow-sm",

        // Success green button
        success: "bg-[var(--ns-green)] text-secondary border border-[var(--ns-green-light)] hover:bg-[var(--ns-green)]/90 shadow-sm",

        // Link style (no button appearance)
        link: "text-primary-500 underline-offset-4 hover:underline hover:scale-100",
      },
      size: {
        sm: "h-9 px-4 py-1 text-xs",
        default: "h-11 px-[18px] py-2.5 text-base",
        md: "h-11 px-5 py-2.5 text-sm min-w-[90px]",
        lg: "h-12 px-6 py-3 text-base",
        xl: "h-[54px] px-8 py-3.5 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        aria-disabled={disabled}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }