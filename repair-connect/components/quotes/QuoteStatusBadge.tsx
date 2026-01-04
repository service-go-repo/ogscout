'use client';

import { QuoteStatus } from '@/stores/quoteRequestStore';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  Clock,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuoteStatusBadgeProps {
  status: QuoteStatus;
  quotedAmount?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<
  QuoteStatus,
  {
    label: string;
    icon: typeof Check;
    colorClasses: string;
    description: string;
  }
> = {
  pending: {
    label: 'Sending...',
    icon: Loader2,
    colorClasses:
      'bg-[var(--ns-cyan-light)] text-secondary border-[var(--ns-cyan)]',
    description: 'Quote request is being sent',
  },
  submitted: {
    label: 'Quote Sent',
    icon: Check,
    colorClasses:
      'bg-[var(--ns-green-light)] text-secondary border-[var(--ns-green)]',
    description: 'Quote request sent, awaiting workshop response',
  },
  viewed: {
    label: 'Viewed',
    icon: Eye,
    colorClasses:
      'bg-primary-100 text-secondary border-primary-300',
    description: 'Workshop has viewed your quote request',
  },
  quoted: {
    label: 'Quote Received',
    icon: FileText,
    colorClasses:
      'bg-primary-100 text-secondary border-primary-300',
    description: 'Workshop has sent you a quote',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    colorClasses:
      'bg-[var(--ns-green-light)] text-secondary border-[var(--ns-green)]',
    description: 'You accepted this quote',
  },
  rejected: {
    label: 'Declined',
    icon: XCircle,
    colorClasses:
      'bg-[var(--background-3)] dark:bg-[var(--background-7)] text-secondary/60 dark:text-accent/60 border-[var(--stroke-3)] dark:border-[var(--stroke-7)]',
    description: 'You declined this quote',
  },
  expired: {
    label: 'Expired',
    icon: AlertCircle,
    colorClasses:
      'bg-[var(--ns-yellow-light)] text-secondary border-[var(--ns-yellow)]',
    description: 'Quote request has expired',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    colorClasses:
      'bg-[var(--ns-red)]/20 text-secondary border-[var(--ns-red)]',
    description: 'Failed to send quote request',
  },
};

export default function QuoteStatusBadge({
  status,
  quotedAmount,
  size = 'md',
  showIcon = true,
  className,
}: QuoteStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border font-medium',
        config.colorClasses,
        sizeClasses[size],
        className
      )}
      role="status"
      aria-live="polite"
      title={config.description}
    >
      {showIcon && (
        <Icon
          className={cn(
            iconSizes[size],
            status === 'pending' && 'animate-spin'
          )}
        />
      )}
      <span>{config.label}</span>
      {status === 'quoted' && quotedAmount && (
        <span className="font-semibold">
          • AED {quotedAmount.toLocaleString()}
        </span>
      )}
    </div>
  );
}

/**
 * Compact version for use in cards
 */
export function QuoteStatusBadgeCompact({
  status,
  className,
}: {
  status: QuoteStatus;
  className?: string;
}) {
  return (
    <QuoteStatusBadge
      status={status}
      size="sm"
      showIcon={true}
      className={className}
    />
  );
}

/**
 * Get status progression info for UI
 */
export function getStatusProgression(status: QuoteStatus): {
  currentStep: number;
  totalSteps: number;
  nextStep: string | null;
} {
  const progression: Record<QuoteStatus, { step: number; next: string | null }> = {
    pending: { step: 0, next: 'Quote will be sent' },
    submitted: { step: 1, next: 'Waiting for workshop to view' },
    viewed: { step: 2, next: 'Waiting for workshop quote' },
    quoted: { step: 3, next: 'Review and accept/decline' },
    accepted: { step: 4, next: null },
    rejected: { step: 4, next: null },
    expired: { step: 4, next: null },
    failed: { step: 0, next: 'Retry sending quote' },
  };

  const info = progression[status];

  return {
    currentStep: info.step,
    totalSteps: 4,
    nextStep: info.next,
  };
}
