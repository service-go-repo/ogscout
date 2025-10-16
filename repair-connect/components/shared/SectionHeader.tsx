/**
 * SectionHeader Component
 * Reusable section header with consistent styling
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  centered?: boolean;
  className?: string;
  children?: ReactNode;
}

export function SectionHeader({
  title,
  subtitle,
  badge,
  centered = true,
  className,
  children,
}: SectionHeaderProps) {
  return (
    <div className={cn('space-y-4 mb-12', centered && 'text-center', className)}>
      {badge && (
        <div className={cn('inline-flex', centered && 'justify-center w-full')}>
          <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            {badge}
          </span>
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className={cn('text-lg text-muted-foreground max-w-2xl', centered && 'mx-auto')}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
