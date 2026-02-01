import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[45px] w-full rounded-full border border-stroke-3 dark:border-stroke-7 bg-background-1 dark:bg-background-6 text-secondary dark:text-accent px-[18px] py-2 text-tagline-2 file:border-0 file:bg-transparent file:text-tagline-2 file:font-medium placeholder:text-secondary/60 dark:placeholder:text-accent/60 focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-[var(--ns-red)] aria-[invalid=true]:ring-[var(--ns-red)] transition-colors duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
