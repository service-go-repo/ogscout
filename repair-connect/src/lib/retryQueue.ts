import { toast } from 'sonner';

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  onRetry?: (attempt: number, delay: number) => void;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2, // Exponential backoff: 1s, 2s, 4s, 8s...
};

/**
 * Retry item in the queue
 */
interface RetryItem<T = any> {
  id: string;
  fn: () => Promise<T>;
  config: RetryConfig;
  attempt: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  status: 'pending' | 'retrying' | 'success' | 'failed';
  error?: Error;
  result?: T;
}

/**
 * Retry Queue Manager
 * Handles automatic retries with exponential backoff
 */
class RetryQueueManager {
  private queue: Map<string, RetryItem> = new Map();
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  /**
   * Add an item to the retry queue
   */
  async enqueue<T>(
    id: string,
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

    const item: RetryItem<T> = {
      id,
      fn,
      config: fullConfig,
      attempt: 0,
      status: 'pending',
    };

    this.queue.set(id, item);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.startProcessing();
    }

    // Execute immediately for the first attempt
    return this.executeItem(item);
  }

  /**
   * Execute an item from the queue
   */
  private async executeItem<T>(item: RetryItem<T>): Promise<T> {
    item.attempt++;
    item.lastAttemptAt = new Date();
    item.status = 'retrying';

    try {
      const result = await item.fn();

      // Success!
      item.status = 'success';
      item.result = result;
      this.queue.delete(item.id);

      if (item.config.onSuccess) {
        item.config.onSuccess();
      }

      return result;
    } catch (error) {
      const err = error as Error;
      item.error = err;

      // Check if we should retry
      if (item.attempt < item.config.maxRetries) {
        // Calculate next retry delay with exponential backoff
        const delay = Math.min(
          item.config.initialDelay * Math.pow(item.config.backoffMultiplier, item.attempt - 1),
          item.config.maxDelay
        );

        item.nextRetryAt = new Date(Date.now() + delay);
        item.status = 'pending';

        console.log(
          `[RetryQueue] ${item.id} failed (attempt ${item.attempt}/${item.config.maxRetries}). Retrying in ${delay}ms...`
        );

        if (item.config.onRetry) {
          item.config.onRetry(item.attempt, delay);
        }

        // Wait and retry
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeItem(item);
      } else {
        // Max retries reached
        item.status = 'failed';
        this.queue.delete(item.id);

        console.error(`[RetryQueue] ${item.id} failed after ${item.attempt} attempts:`, err);

        if (item.config.onFailure) {
          item.config.onFailure(err);
        }

        throw err;
      }
    }
  }

  /**
   * Start processing the queue
   */
  private startProcessing() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    // Process queue every 5 seconds
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 5000);
  }

  /**
   * Process pending items in the queue
   */
  private async processQueue() {
    const now = new Date();

    for (const item of this.queue.values()) {
      if (item.status === 'pending' && item.nextRetryAt && item.nextRetryAt <= now) {
        this.executeItem(item).catch(() => {
          // Error already handled in executeItem
        });
      }
    }

    // Stop processing if queue is empty
    if (this.queue.size === 0) {
      this.stopProcessing();
    }
  }

  /**
   * Stop processing the queue
   */
  private stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isProcessing = false;
  }

  /**
   * Get queue status
   */
  getStatus() {
    const items = Array.from(this.queue.values());

    return {
      total: items.length,
      pending: items.filter((i) => i.status === 'pending').length,
      retrying: items.filter((i) => i.status === 'retrying').length,
      failed: items.filter((i) => i.status === 'failed').length,
      items: items.map((i) => ({
        id: i.id,
        attempt: i.attempt,
        status: i.status,
        nextRetryAt: i.nextRetryAt,
        error: i.error?.message,
      })),
    };
  }

  /**
   * Remove an item from the queue
   */
  remove(id: string) {
    this.queue.delete(id);
  }

  /**
   * Clear all items from the queue
   */
  clear() {
    this.queue.clear();
    this.stopProcessing();
  }
}

// Singleton instance
export const retryQueue = new RetryQueueManager();

/**
 * Helper function to retry a quote request with exponential backoff
 */
export async function retryQuoteRequest<T>(
  quoteId: string,
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    showToast?: boolean;
  }
): Promise<T> {
  const { maxRetries = 3, showToast = true } = options || {};

  return retryQueue.enqueue(quoteId, fn, {
    maxRetries,
    onRetry: (attempt, delay) => {
      if (showToast) {
        toast.info(`Retrying quote request (attempt ${attempt}/${maxRetries})`, {
          description: `Next retry in ${Math.round(delay / 1000)}s`,
          duration: delay,
        });
      }
    },
    onSuccess: () => {
      if (showToast) {
        toast.success('Quote request sent successfully!');
      }
    },
    onFailure: (error) => {
      if (showToast) {
        toast.error('Failed to send quote request', {
          description: error.message,
          action: {
            label: 'Dismiss',
            onClick: () => {},
          },
        });
      }
    },
  });
}

/**
 * Persist retry queue to localStorage
 * Useful for recovering failed requests after page reload
 */
export function persistRetryQueue() {
  if (typeof window === 'undefined') return;

  const status = retryQueue.getStatus();

  localStorage.setItem(
    'retry-queue',
    JSON.stringify({
      timestamp: new Date().toISOString(),
      items: status.items,
    })
  );
}

/**
 * Restore retry queue from localStorage
 */
export function restoreRetryQueue() {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem('retry-queue');
    if (!stored) return;

    const data = JSON.parse(stored);
    const timestamp = new Date(data.timestamp);

    // Only restore if less than 1 hour old
    if (Date.now() - timestamp.getTime() > 3600000) {
      localStorage.removeItem('retry-queue');
      return;
    }

    console.log('[RetryQueue] Restoring', data.items.length, 'items from localStorage');

    // TODO: Re-enqueue items if needed
    // This would require storing the request data as well
  } catch (error) {
    console.error('[RetryQueue] Failed to restore queue:', error);
    localStorage.removeItem('retry-queue');
  }
}
