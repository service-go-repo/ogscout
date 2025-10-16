import * as React from "react"
import { cn } from "@/lib/utils"

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width constraint
   * @default "7xl"
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full"
  /**
   * Whether to add vertical padding
   * @default true
   */
  withPadding?: boolean
  /**
   * Whether to center content horizontally
   * @default true
   */
  centered?: boolean
}

/**
 * PageContainer - Consistent page layout wrapper
 *
 * Provides consistent width constraints, padding, and responsive spacing
 * for all page content following the Twitter theme design system.
 *
 * @example
 * ```tsx
 * <PageContainer>
 *   <h1>Page Title</h1>
 *   <p>Content</p>
 * </PageContainer>
 * ```
 *
 * @example
 * ```tsx
 * // Narrow content (reading)
 * <PageContainer maxWidth="3xl">
 *   <article>Blog post content</article>
 * </PageContainer>
 * ```
 *
 * @example
 * ```tsx
 * // Full width, no padding
 * <PageContainer maxWidth="full" withPadding={false}>
 *   <div>Custom layout</div>
 * </PageContainer>
 * ```
 */
export function PageContainer({
  maxWidth = "7xl",
  withPadding = true,
  centered = true,
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        // Base container
        "w-full",
        // Responsive horizontal padding (Twitter theme: 4px grid)
        withPadding && "px-4 sm:px-6 lg:px-8",
        // Vertical padding (generous Twitter-style spacing)
        withPadding && "py-8 sm:py-10 lg:py-12",
        // Center content
        centered && "mx-auto",
        // Max width constraints
        maxWidth === "sm" && "max-w-sm",
        maxWidth === "md" && "max-w-md",
        maxWidth === "lg" && "max-w-lg",
        maxWidth === "xl" && "max-w-xl",
        maxWidth === "2xl" && "max-w-2xl",
        maxWidth === "3xl" && "max-w-3xl",
        maxWidth === "4xl" && "max-w-4xl",
        maxWidth === "5xl" && "max-w-5xl",
        maxWidth === "6xl" && "max-w-6xl",
        maxWidth === "7xl" && "max-w-7xl",
        maxWidth === "full" && "max-w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * PageHeader - Consistent page header with title and description
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Dashboard"
 *   description="Welcome back! Here's your overview."
 * />
 * ```
 */
interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    </div>
  )
}

/**
 * PageSection - Semantic section wrapper with optional title
 *
 * @example
 * ```tsx
 * <PageSection title="Recent Activity">
 *   <Card>...</Card>
 * </PageSection>
 * ```
 */
interface PageSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function PageSection({
  title,
  description,
  action,
  className,
  children,
  ...props
}: PageSectionProps) {
  return (
    <section className={cn("space-y-6", className)} {...props}>
      {(title || action) && (
        <div className="flex items-start justify-between">
          <div>
            {title && (
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action && <div className="ml-4">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

/**
 * PageGrid - Responsive grid layout for cards/items
 *
 * @example
 * ```tsx
 * <PageGrid>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </PageGrid>
 * ```
 */
interface PageGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns at different breakpoints
   * @default { sm: 1, md: 2, lg: 3, xl: 4 }
   */
  cols?: {
    sm?: 1 | 2 | 3 | 4
    md?: 1 | 2 | 3 | 4
    lg?: 1 | 2 | 3 | 4
    xl?: 1 | 2 | 3 | 4
  }
  /**
   * Gap between grid items (in Tailwind spacing scale)
   * @default 6 (24px - Twitter theme)
   */
  gap?: 2 | 3 | 4 | 6 | 8
}

export function PageGrid({
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6,
  className,
  children,
  ...props
}: PageGridProps) {
  return (
    <div
      className={cn(
        "grid",
        // Gap
        gap === 2 && "gap-2",
        gap === 3 && "gap-3",
        gap === 4 && "gap-4",
        gap === 6 && "gap-6",
        gap === 8 && "gap-8",
        // Responsive columns
        cols.sm === 1 && "grid-cols-1",
        cols.sm === 2 && "grid-cols-2",
        cols.sm === 3 && "grid-cols-3",
        cols.sm === 4 && "grid-cols-4",
        cols.md === 1 && "md:grid-cols-1",
        cols.md === 2 && "md:grid-cols-2",
        cols.md === 3 && "md:grid-cols-3",
        cols.md === 4 && "md:grid-cols-4",
        cols.lg === 1 && "lg:grid-cols-1",
        cols.lg === 2 && "lg:grid-cols-2",
        cols.lg === 3 && "lg:grid-cols-3",
        cols.lg === 4 && "lg:grid-cols-4",
        cols.xl === 1 && "xl:grid-cols-1",
        cols.xl === 2 && "xl:grid-cols-2",
        cols.xl === 3 && "xl:grid-cols-3",
        cols.xl === 4 && "xl:grid-cols-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
