import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Car } from '@/models/Car';

/**
 * Service request interface for quote flow
 */
export interface ServiceRequest {
  _id: string;
  carId: string;
  customerId: string;
  requestedServices: string[];
  damageAssessments?: Array<{
    location: string;
    description: string;
    severity: 'minor' | 'moderate' | 'severe';
    photos?: string[];
  }>;
  photos?: Array<{
    url: string;
    publicId: string;
  }>;
  status: 'created' | 'submitted' | 'quoted' | 'accepted' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Modal view state for quote request flow
 */
export type ModalView = 'cars' | 'services' | 'workshops' | 'car-registration' | 'service-request' | 'closed';

/**
 * Quote status lifecycle:
 * - pending: Quote request is being sent
 * - submitted: Quote request sent, awaiting workshop response (ACTIVE)
 * - viewed: Workshop has viewed the quote request (ACTIVE)
 * - quoted: Workshop has submitted a quote (ACTIVE)
 * - accepted: Customer accepted the quote (COMPLETED)
 * - rejected: Customer rejected the quote (COMPLETED)
 * - expired: Quote request expired (COMPLETED)
 * - failed: Failed to send quote request (INACTIVE)
 */
export type QuoteStatus =
  | 'pending'
  | 'submitted'
  | 'viewed'
  | 'quoted'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'failed';

/**
 * Helper to determine if a quote status is "active" (prevents new quotes)
 * Active statuses: submitted, viewed, quoted
 * Completed/Inactive statuses: accepted, rejected, expired, failed
 */
export function isQuoteStatusActive(status: QuoteStatus): boolean {
  return ['submitted', 'viewed', 'quoted'].includes(status);
}

/**
 * Represents a sent quote keyed by `${carId}_${workshopId}`
 */
export interface SentQuote {
  carId: string;
  workshopId: string;
  workshopName: string;
  quotationId: string;
  timestamp: Date;
  status: QuoteStatus;
  // Additional metadata
  quotedAmount?: number;
  quotedAt?: Date;
  expiresAt?: Date;
  lastUpdated: Date;
  retryCount?: number;
}

export interface QuoteRequestState {
  // Selected car for the current quote request flow
  selectedCar: Car | null;

  // Selected service request for the quote flow
  selectedService: ServiceRequest | null;

  // Modal view state for multi-step flow
  modalView: ModalView;

  // Map of sent quotes: key is `${carId}_${workshopId}`, value is SentQuote
  sentQuotes: Record<string, SentQuote>;

  // Loading states for optimistic UI
  sendingQuotes: Set<string>; // Set of `${carId}_${workshopId}` being processed

  // Actions
  setSelectedCar: (car: Car | null) => void;
  clearSelectedCar: () => void;

  // Service selection actions
  setSelectedService: (service: ServiceRequest | null) => void;
  clearSelectedService: () => void;

  // Modal view actions
  setModalView: (view: ModalView) => void;
  openCarSelection: () => void;
  openServiceSelection: () => void;
  openWorkshopSelection: () => void;
  openCarRegistration: () => void;
  openServiceRequest: () => void;
  closeModal: () => void;

  // Optimistic quote sending
  markQuoteSending: (carId: string, workshopId: string) => void;
  markQuoteSent: (quote: SentQuote) => void;
  markQuoteFailed: (carId: string, workshopId: string) => void;

  // Query helpers
  hasQuoteSent: (carId: string | undefined, workshopId: string | undefined) => boolean;
  isQuoteSending: (carId: string | undefined, workshopId: string | undefined) => boolean;
  getQuoteStatus: (carId: string | undefined, workshopId: string | undefined) => SentQuote | null;
  getQuotesByStatus: (status: QuoteStatus) => SentQuote[];
  getQuotesByCarId: (carId: string) => SentQuote[];

  // Status update
  updateQuoteStatus: (carId: string, workshopId: string, status: QuoteStatus, metadata?: Partial<SentQuote>) => void;

  // Bulk operations for "Select All" functionality
  markMultipleQuotesSent: (quotes: SentQuote[]) => void;

  // Server reconciliation
  syncFromServer: (serverQuotes: SentQuote[]) => void;

  // Check if quote is active (prevents duplicate)
  isQuoteActive: (carId: string | undefined, workshopId: string | undefined) => boolean;

  // Reset state (clears car + quotes)
  reset: () => void;

  // Clear all state (for logout)
  clearAllState: () => void;
}

const initialState = {
  selectedCar: null,
  selectedService: null,
  modalView: 'closed' as ModalView,
  sentQuotes: {},
  sendingQuotes: new Set<string>(),
};

export const useQuoteRequestStore = create<QuoteRequestState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedCar: (car) => set({ selectedCar: car }),

      clearSelectedCar: () => set({ selectedCar: null }),

      setSelectedService: (service) => set({ selectedService: service }),

      clearSelectedService: () => set({ selectedService: null }),

      setModalView: (view) => set({ modalView: view }),

      openCarSelection: () => set({ modalView: 'cars' }),

      openServiceSelection: () => set({ modalView: 'services' }),

      openWorkshopSelection: () => set({ modalView: 'workshops' }),

      openCarRegistration: () => set({ modalView: 'car-registration' }),

      openServiceRequest: () => set({ modalView: 'service-request' }),

      closeModal: () => set({ modalView: 'closed' }),

      markQuoteSending: (carId, workshopId) => {
        const key = `${carId}_${workshopId}`;
        set((state) => ({
          sendingQuotes: new Set(state.sendingQuotes).add(key),
        }));
      },

      markQuoteSent: (quote) => {
        const key = `${quote.carId}_${quote.workshopId}`;
        set((state) => {
          const newSendingQuotes = new Set(state.sendingQuotes);
          newSendingQuotes.delete(key);

          return {
            sentQuotes: {
              ...state.sentQuotes,
              [key]: {
                ...quote,
                status: 'submitted',
                timestamp: new Date(quote.timestamp),
                lastUpdated: new Date(),
                retryCount: 0,
              },
            },
            sendingQuotes: newSendingQuotes,
          };
        });
      },

      markQuoteFailed: (carId, workshopId) => {
        const key = `${carId}_${workshopId}`;
        set((state) => {
          const newSendingQuotes = new Set(state.sendingQuotes);
          newSendingQuotes.delete(key);

          // Optionally mark as failed in sentQuotes for retry logic
          const existingQuote = state.sentQuotes[key];
          if (existingQuote) {
            return {
              sentQuotes: {
                ...state.sentQuotes,
                [key]: {
                  ...existingQuote,
                  status: 'failed',
                },
              },
              sendingQuotes: newSendingQuotes,
            };
          }

          return { sendingQuotes: newSendingQuotes };
        });
      },

      hasQuoteSent: (carId, workshopId) => {
        if (!carId || !workshopId) return false;
        const key = `${carId}_${workshopId}`;
        const quote = get().sentQuotes[key];
        // Only return true if quote exists and is in active state
        return quote ? isQuoteStatusActive(quote.status) : false;
      },

      isQuoteActive: (carId, workshopId) => {
        if (!carId || !workshopId) return false;
        const key = `${carId}_${workshopId}`;
        const quote = get().sentQuotes[key];
        return quote ? isQuoteStatusActive(quote.status) : false;
      },

      isQuoteSending: (carId, workshopId) => {
        if (!carId || !workshopId) return false;
        const key = `${carId}_${workshopId}`;
        return get().sendingQuotes.has(key);
      },

      getQuoteStatus: (carId, workshopId) => {
        if (!carId || !workshopId) return null;
        const key = `${carId}_${workshopId}`;
        return get().sentQuotes[key] || null;
      },

      getQuotesByStatus: (status) => {
        return Object.values(get().sentQuotes).filter(quote => quote.status === status);
      },

      getQuotesByCarId: (carId) => {
        return Object.values(get().sentQuotes).filter(quote => quote.carId === carId);
      },

      updateQuoteStatus: (carId, workshopId, status, metadata = {}) => {
        const key = `${carId}_${workshopId}`;
        set((state) => {
          const existingQuote = state.sentQuotes[key];
          if (!existingQuote) return state;

          return {
            sentQuotes: {
              ...state.sentQuotes,
              [key]: {
                ...existingQuote,
                ...metadata,
                status,
                lastUpdated: new Date(),
              },
            },
          };
        });
      },

      markMultipleQuotesSent: (quotes) => {
        set((state) => {
          const newSentQuotes = { ...state.sentQuotes };
          const newSendingQuotes = new Set(state.sendingQuotes);

          quotes.forEach((quote) => {
            const key = `${quote.carId}_${quote.workshopId}`;
            newSentQuotes[key] = {
              ...quote,
              status: 'submitted',
              timestamp: new Date(quote.timestamp),
            };
            newSendingQuotes.delete(key);
          });

          return {
            sentQuotes: newSentQuotes,
            sendingQuotes: newSendingQuotes,
          };
        });
      },

      syncFromServer: (serverQuotes) => {
        set((state) => {
          const newSentQuotes = { ...state.sentQuotes };

          serverQuotes.forEach((quote) => {
            const key = `${quote.carId}_${quote.workshopId}`;
            // Server data is source of truth - overwrite local optimistic data
            newSentQuotes[key] = {
              ...quote,
              status: 'submitted',
              timestamp: new Date(quote.timestamp),
            };
          });

          return { sentQuotes: newSentQuotes };
        });
      },

      reset: () => set(initialState),

      clearAllState: () => {
        // Clear all state and localStorage
        set(initialState);
        // Force clear localStorage to ensure complete cleanup
        if (typeof window !== 'undefined') {
          localStorage.removeItem('quote-request-storage');
        }
      },
    }),
    {
      name: 'quote-request-storage',
      storage: createJSONStorage(() => localStorage),
      // Don't persist sendingQuotes and modalView (transient state)
      partialize: (state) => ({
        selectedCar: state.selectedCar,
        selectedService: state.selectedService,
        sentQuotes: state.sentQuotes,
      }),
    }
  )
);
