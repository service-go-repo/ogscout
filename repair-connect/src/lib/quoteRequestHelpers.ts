import { Car } from '@/models/Car';
import { Workshop } from '@/models/Workshop';
import { useQuoteRequestStore, SentQuote } from '@/stores/quoteRequestStore';
import { toast } from 'sonner';
import { retryQuoteRequest } from './retryQueue';
import { trackQuoteRequest } from './analytics';

/**
 * Send a quote request to a single workshop
 * Uses optimistic UI and includes idempotency key
 *
 * @param workshopId - Workshop user ID to send quote to
 * @param car - Selected car for the quote request
 * @param options - Additional options (description, services, etc.)
 * @returns Promise resolving to quotation ID or null on failure
 */
export async function sendSingleQuoteRequest(
  workshopId: string,
  workshopName: string,
  car: Car,
  options?: {
    damageDescription?: string;
    requestedServices?: string[];
    urgency?: 'low' | 'medium' | 'high';
    notes?: string;
    sourceServiceRequestId?: string;
  }
): Promise<string | null> {
  const {
    damageDescription = 'Quote request from workshop selection',
    requestedServices = ['repair'],
    urgency = 'medium',
    notes,
    sourceServiceRequestId,
  } = options || {};

  const store = useQuoteRequestStore.getState();
  const carId = car._id?.toString();

  if (!carId) {
    console.error('Invalid car ID');
    toast.error('Invalid car selection');
    return null;
  }

  // Generate idempotency key for this request
  const idempotencyKey = `quote_${carId}_${workshopId}_${Date.now()}`;

  // Optimistic UI: Mark as sending
  store.markQuoteSending(carId, workshopId);

  // Use retry queue for resilient sending
  try {
    const quotationId = await retryQuoteRequest(
      `${carId}_${workshopId}`,
      async () => {
        return await sendQuoteRequestInternal(
          workshopId,
          workshopName,
          car,
          carId,
          idempotencyKey,
          options
        );
      },
      { maxRetries: 3, showToast: false } // We handle toasts manually
    );

    if (!quotationId) {
      throw new Error('Failed to send quote request');
    }

    // Create sent quote record
    const sentQuote: SentQuote = {
      carId,
      workshopId,
      workshopName,
      quotationId,
      timestamp: new Date(),
      lastUpdated: new Date(),
      status: 'submitted',
      retryCount: 0,
    };

    // Update store with success
    store.markQuoteSent(sentQuote);

    // Track analytics
    trackQuoteRequest('quote_sent', {
      workshopId,
      workshopName,
      carId,
      quotationId,
    });

    toast.success(`Quote request sent to ${workshopName}`, {
      description: 'You will be notified when they respond',
    });

    console.log('[Quote Request] Success:', quotationId);
    return quotationId;
  } catch (error) {
    console.error('[Quote Request] Failed:', error);

    // Rollback optimistic UI
    store.markQuoteFailed(carId, workshopId);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to send quote request';

    // Track failure
    trackQuoteRequest('quote_failed', {
      workshopId,
      workshopName,
      carId,
      error: errorMessage,
    });

    toast.error(`Failed to send quote to ${workshopName}`, {
      description: errorMessage,
      action: {
        label: 'Retry',
        onClick: () => {
          // Retry the request
          sendSingleQuoteRequest(workshopId, workshopName, car, options);
        },
      },
    });

    return null;
  }
}

/**
 * Internal function that performs the actual API call
 * Separated for retry logic
 */
async function sendQuoteRequestInternal(
  workshopId: string,
  workshopName: string,
  car: Car,
  carId: string,
  idempotencyKey: string,
  options?: {
    damageDescription?: string;
    requestedServices?: string[];
    urgency?: 'low' | 'medium' | 'high';
    notes?: string;
    sourceServiceRequestId?: string;
  }
): Promise<string | null> {
  const {
    damageDescription = 'Quote request from workshop selection',
    requestedServices = ['repair'],
    urgency = 'medium',
    notes,
    sourceServiceRequestId,
  } = options || {};

  try {
    const quoteRequest = {
      selectedCarId: carId,
      requestedServices,
      damageDescription,
      urgency,
      address: (car as any).location?.address || 'Address not specified',
      city: (car as any).location?.city || 'Dubai',
      state: (car as any).location?.state || 'Dubai',
      location: {
        coordinates: (car as any).location?.coordinates || [55.3781, 25.1772], // Default Dubai
      },
      targetWorkshops: [workshopId], // Single workshop
      maxDistance: 50,
      notes,
      sourceServiceRequestId,
    };

    console.log('[Quote Request] Sending to workshop:', workshopId, 'for car:', carId);

    const response = await fetch('/api/quotations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey, // Prevent duplicate requests
      },
      body: JSON.stringify(quoteRequest),
    });

    const result = await response.json();

    if (result.success && result.data) {
      return result.data._id;
    } else {
      throw new Error(result.error || 'Failed to send quote request');
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Debounced version to prevent rapid duplicate clicks
 * Stores in-flight requests to prevent duplicates
 */
const inflightRequests = new Map<string, Promise<string | null>>();

export async function sendSingleQuoteRequestDebounced(
  workshopId: string,
  workshopName: string,
  car: Car,
  options?: Parameters<typeof sendSingleQuoteRequest>[3]
): Promise<string | null> {
  const carId = car._id?.toString();
  if (!carId) return null;

  const key = `${carId}_${workshopId}`;

  // If already in-flight, return existing promise
  if (inflightRequests.has(key)) {
    console.log('[Quote Request] Already in-flight, reusing promise:', key);
    return inflightRequests.get(key)!;
  }

  // Create new request
  const promise = sendSingleQuoteRequest(
    workshopId,
    workshopName,
    car,
    options
  ).finally(() => {
    // Clean up after request completes
    inflightRequests.delete(key);
  });

  inflightRequests.set(key, promise);
  return promise;
}

/**
 * Send quote requests to multiple workshops (for "Select All" functionality)
 * This should remain unchanged to preserve existing behavior
 */
export async function sendBulkQuoteRequests(
  workshopIds: string[],
  workshopNames: Record<string, string>,
  car: Car,
  options?: Parameters<typeof sendSingleQuoteRequest>[3]
): Promise<{ success: number; failed: number }> {
  const carId = car._id?.toString();
  if (!carId) {
    toast.error('Invalid car selection');
    return { success: 0, failed: workshopIds.length };
  }

  const store = useQuoteRequestStore.getState();

  // Mark all as sending (optimistic)
  workshopIds.forEach((workshopId) => {
    store.markQuoteSending(carId, workshopId);
  });

  // Use existing bulk API endpoint (unchanged)
  const {
    damageDescription = 'Quote request from workshop selection',
    requestedServices = ['repair'],
    urgency = 'medium',
    notes,
    sourceServiceRequestId,
  } = options || {};

  try {
    const quoteRequest = {
      selectedCarId: carId,
      requestedServices,
      damageDescription,
      urgency,
      address: (car as any).location?.address || 'Address not specified',
      city: (car as any).location?.city || 'Dubai',
      state: (car as any).location?.state || 'Dubai',
      location: {
        coordinates: (car as any).location?.coordinates || [55.3781, 25.1772],
      },
      targetWorkshops: workshopIds, // Multiple workshops
      maxDistance: 50,
      notes,
      sourceServiceRequestId,
    };

    const response = await fetch('/api/quotations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quoteRequest),
    });

    const result = await response.json();

    if (result.success && result.data) {
      const quotationId = result.data._id;

      // Create sent quote records for all workshops
      const sentQuotes: SentQuote[] = workshopIds.map((workshopId) => ({
        carId,
        workshopId,
        workshopName: workshopNames[workshopId] || 'Unknown Workshop',
        quotationId,
        timestamp: new Date(),
        lastUpdated: new Date(),
        status: 'submitted' as const,
        retryCount: 0,
      }));

      // Update store with all successes
      store.markMultipleQuotesSent(sentQuotes);

      toast.success(
        `Quote request sent to ${workshopIds.length} workshop${
          workshopIds.length > 1 ? 's' : ''
        }!`
      );

      return { success: workshopIds.length, failed: 0 };
    } else {
      throw new Error(result.error || 'Failed to send quote requests');
    }
  } catch (error) {
    console.error('[Bulk Quote Request] Failed:', error);

    // Rollback all
    workshopIds.forEach((workshopId) => {
      store.markQuoteFailed(carId, workshopId);
    });

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to send quote requests';

    toast.error('Failed to send quote requests', {
      description: errorMessage,
    });

    return { success: 0, failed: workshopIds.length };
  }
}

/**
 * Helper to generate UUID for idempotency (alternative to importing uuid)
 * If uuid package is not available, use this simple implementation
 */
function generateIdempotencyKey(carId: string, workshopId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `quote_${carId}_${workshopId}_${timestamp}_${random}`;
}
