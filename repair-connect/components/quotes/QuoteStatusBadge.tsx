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
      'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    description: 'Quote request is being sent',
  },
  submitted: {
    label: 'Quote Sent',
    icon: Check,
    colorClasses:
      'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    description: 'Quote request sent, awaiting workshop response',
  },
  viewed: {
    label: 'Viewed',
    icon: Eye,
    colorClasses:
      'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    description: 'Workshop has viewed your quote request',
  },
  quoted: {
    label: 'Quote Received',
    icon: FileText,
    colorClasses:
      'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    description: 'Workshop has sent you a quote',
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    colorClasses:
      'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    description: 'You accepted this quote',
  },
  rejected: {
    label: 'Declined',
    icon: XCircle,
    colorClasses:
      'bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800',
    description: 'You declined this quote',
  },
  expired: {
    label: 'Expired',
    icon: AlertCircle,
    colorClasses:
      'bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    description: 'Quote request has expired',
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    colorClasses:
      'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
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
