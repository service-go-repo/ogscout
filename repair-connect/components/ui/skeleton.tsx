import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-background-3 dark:bg-background-7", className)}
      {...props}
    />
  )
}

export { Skeleton }
