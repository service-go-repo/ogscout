import { renderHook, act } from '@testing-library/react';
import { useQuoteRequestStore, SentQuote, isQuoteStatusActive, QuoteStatus } from '@/stores/quoteRequestStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('quoteRequestStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useQuoteRequestStore.getState().clearAllState();
    localStorageMock.clear();
  });

  describe('isQuoteStatusActive helper', () => {
    it('should return true for active statuses', () => {
      expect(isQuoteStatusActive('submitted')).toBe(true);
      expect(isQuoteStatusActive('viewed')).toBe(true);
      expect(isQuoteStatusActive('quoted')).toBe(true);
    });

    it('should return false for completed/inactive statuses', () => {
      expect(isQuoteStatusActive('accepted')).toBe(false);
      expect(isQuoteStatusActive('rejected')).toBe(false);
      expect(isQuoteStatusActive('expired')).toBe(false);
      expect(isQuoteStatusActive('failed')).toBe(false);
      expect(isQuoteStatusActive('pending')).toBe(false);
    });
  });

  describe('selectedCar management', () => {
    it('should set and clear selected car', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      const mockCar: any = {
        _id: 'car123',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
      };

      act(() => {
        result.current.setSelectedCar(mockCar);
      });

      expect(result.current.selectedCar).toEqual(mockCar);

      act(() => {
        result.current.clearSelectedCar();
      });

      expect(result.current.selectedCar).toBeNull();
    });
  });

  describe('sentQuotes management', () => {
    it('should mark quote as sending', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      act(() => {
        result.current.markQuoteSending('car123', 'workshop456');
      });

      expect(result.current.isQuoteSending('car123', 'workshop456')).toBe(true);
      expect(result.current.hasQuoteSent('car123', 'workshop456')).toBe(false);
    });

    it('should mark quote as sent and remove from sending', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      const sentQuote: SentQuote = {
        carId: 'car123',
        workshopId: 'workshop456',
        workshopName: 'Test Workshop',
        quotationId: 'quote789',
        timestamp: new Date(),
        status: 'submitted',
      };

      act(() => {
        result.current.markQuoteSending('car123', 'workshop456');
      });

      expect(result.current.isQuoteSending('car123', 'workshop456')).toBe(true);

      act(() => {
        result.current.markQuoteSent(sentQuote);
      });

      expect(result.current.isQuoteSending('car123', 'workshop456')).toBe(false);
      expect(result.current.hasQuoteSent('car123', 'workshop456')).toBe(true);

      const status = result.current.getQuoteStatus('car123', 'workshop456');
      expect(status).toMatchObject({
        carId: 'car123',
        workshopId: 'workshop456',
        quotationId: 'quote789',
        status: 'submitted',
      });
    });

    it('should mark quote as failed and remove from sending', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      act(() => {
        result.current.markQuoteSending('car123', 'workshop456');
      });

      expect(result.current.isQuoteSending('car123', 'workshop456')).toBe(true);

      act(() => {
        result.current.markQuoteFailed('car123', 'workshop456');
      });

      expect(result.current.isQuoteSending('car123', 'workshop456')).toBe(false);
      expect(result.current.hasQuoteSent('car123', 'workshop456')).toBe(false);
    });

    it('should mark multiple quotes as sent', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      const quotes: SentQuote[] = [
        {
          carId: 'car123',
          workshopId: 'workshop1',
          workshopName: 'Workshop 1',
          quotationId: 'quote1',
          timestamp: new Date(),
          status: 'submitted',
        },
        {
          carId: 'car123',
          workshopId: 'workshop2',
          workshopName: 'Workshop 2',
          quotationId: 'quote2',
          timestamp: new Date(),
          status: 'submitted',
        },
      ];

      act(() => {
        result.current.markQuoteSending('car123', 'workshop1');
        result.current.markQuoteSending('car123', 'workshop2');
      });

      expect(result.current.isQuoteSending('car123', 'workshop1')).toBe(true);
      expect(result.current.isQuoteSending('car123', 'workshop2')).toBe(true);

      act(() => {
        result.current.markMultipleQuotesSent(quotes);
      });

      expect(result.current.isQuoteSending('car123', 'workshop1')).toBe(false);
      expect(result.current.isQuoteSending('car123', 'workshop2')).toBe(false);
      expect(result.current.hasQuoteSent('car123', 'workshop1')).toBe(true);
      expect(result.current.hasQuoteSent('car123', 'workshop2')).toBe(true);
    });
  });

  describe('server sync', () => {
    it('should sync from server and overwrite local state', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      // Set initial local state
      const localQuote: SentQuote = {
        carId: 'car123',
        workshopId: 'workshop456',
        workshopName: 'Local Workshop',
        quotationId: 'localQuote',
        timestamp: new Date('2024-01-01'),
        status: 'submitted',
      };

      act(() => {
        result.current.markQuoteSent(localQuote);
      });

      // Sync from server with different data
      const serverQuotes: SentQuote[] = [
        {
          carId: 'car123',
          workshopId: 'workshop456',
          workshopName: 'Server Workshop',
          quotationId: 'serverQuote',
          timestamp: new Date('2024-01-02'),
          status: 'submitted',
        },
      ];

      act(() => {
        result.current.syncFromServer(serverQuotes);
      });

      const status = result.current.getQuoteStatus('car123', 'workshop456');
      expect(status?.quotationId).toBe('serverQuote');
      expect(status?.workshopName).toBe('Server Workshop');
    });
  });

  describe('edge cases', () => {
    it('should return false for hasQuoteSent with undefined params', () => {
      const { result } = renderHook(() => useQuoteRequestStore());
      expect(result.current.hasQuoteSent(undefined, undefined)).toBe(false);
      expect(result.current.hasQuoteSent('car123', undefined)).toBe(false);
      expect(result.current.hasQuoteSent(undefined, 'workshop456')).toBe(false);
    });

    it('should return false for isQuoteSending with undefined params', () => {
      const { result } = renderHook(() => useQuoteRequestStore());
      expect(result.current.isQuoteSending(undefined, undefined)).toBe(false);
      expect(result.current.isQuoteSending('car123', undefined)).toBe(false);
      expect(result.current.isQuoteSending(undefined, 'workshop456')).toBe(false);
    });

    it('should return null for getQuoteStatus with undefined params', () => {
      const { result } = renderHook(() => useQuoteRequestStore());
      expect(result.current.getQuoteStatus(undefined, undefined)).toBeNull();
      expect(result.current.getQuoteStatus('car123', undefined)).toBeNull();
      expect(result.current.getQuoteStatus(undefined, 'workshop456')).toBeNull();
    });

    it('should handle quote for different cars separately', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      const quote1: SentQuote = {
        carId: 'car1',
        workshopId: 'workshop1',
        workshopName: 'Workshop 1',
        quotationId: 'quote1',
        timestamp: new Date(),
        status: 'submitted',
      };

      const quote2: SentQuote = {
        carId: 'car2',
        workshopId: 'workshop1',
        workshopName: 'Workshop 1',
        quotationId: 'quote2',
        timestamp: new Date(),
        status: 'submitted',
      };

      act(() => {
        result.current.markQuoteSent(quote1);
        result.current.markQuoteSent(quote2);
      });

      expect(result.current.hasQuoteSent('car1', 'workshop1')).toBe(true);
      expect(result.current.hasQuoteSent('car2', 'workshop1')).toBe(true);
      expect(result.current.hasQuoteSent('car1', 'workshop2')).toBe(false);
    });
  });

  describe('clearAllState', () => {
    it('should clear selectedCar and sentQuotes', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      const mockCar: any = {
        _id: 'car123',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
      };

      const quote: SentQuote = {
        carId: 'car123',
        workshopId: 'workshop456',
        workshopName: 'Test Workshop',
        quotationId: 'quote789',
        timestamp: new Date(),
        status: 'submitted',
        lastUpdated: new Date(),
        retryCount: 0
      };

      act(() => {
        result.current.setSelectedCar(mockCar);
        result.current.markQuoteSent(quote);
      });

      expect(result.current.selectedCar).not.toBeNull();
      expect(Object.keys(result.current.sentQuotes).length).toBeGreaterThan(0);

      act(() => {
        result.current.clearAllState();
      });

      expect(result.current.selectedCar).toBeNull();
      expect(Object.keys(result.current.sentQuotes).length).toBe(0);
    });

    it('should clear localStorage', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      const mockCar: any = {
        _id: 'car123',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
      };

      act(() => {
        result.current.setSelectedCar(mockCar);
      });

      // Verify localStorage has data
      expect(localStorageMock.getItem('quote-request-storage')).toBeTruthy();

      act(() => {
        result.current.clearAllState();
      });

      // Verify localStorage is cleared
      expect(localStorageMock.getItem('quote-request-storage')).toBeNull();
    });
  });

  describe('isQuoteActive', () => {
    it('should return true for active quotes', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      const activeStatuses: QuoteStatus[] = ['submitted', 'viewed', 'quoted'];

      activeStatuses.forEach((status) => {
        const quote: SentQuote = {
          carId: 'car123',
          workshopId: `workshop-${status}`,
          workshopName: 'Test Workshop',
          quotationId: 'quote789',
          timestamp: new Date(),
          status,
          lastUpdated: new Date(),
          retryCount: 0
        };

        act(() => {
          result.current.markQuoteSent(quote);
        });

        expect(result.current.isQuoteActive('car123', `workshop-${status}`)).toBe(true);
      });
    });

    it('should return false for completed/inactive quotes', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      const inactiveStatuses: QuoteStatus[] = ['accepted', 'rejected', 'expired', 'failed'];

      inactiveStatuses.forEach((status) => {
        const quote: SentQuote = {
          carId: 'car123',
          workshopId: `workshop-${status}`,
          workshopName: 'Test Workshop',
          quotationId: 'quote789',
          timestamp: new Date(),
          status,
          lastUpdated: new Date(),
          retryCount: 0
        };

        act(() => {
          result.current.markQuoteSent(quote);
        });

        act(() => {
          result.current.updateQuoteStatus('car123', `workshop-${status}`, status);
        });

        expect(result.current.isQuoteActive('car123', `workshop-${status}`)).toBe(false);
      });
    });
  });

  describe('hasQuoteSent with ACTIVE status checking', () => {
    it('should return false for completed quotes, allowing new quotes to same workshop', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      const quote: SentQuote = {
        carId: 'car123',
        workshopId: 'workshop456',
        workshopName: 'Test Workshop',
        quotationId: 'quote-first',
        timestamp: new Date(),
        status: 'submitted',
        lastUpdated: new Date(),
        retryCount: 0
      };

      act(() => {
        result.current.markQuoteSent(quote);
      });

      // Quote is active, blocks new requests
      expect(result.current.hasQuoteSent('car123', 'workshop456')).toBe(true);

      // Complete the quote
      act(() => {
        result.current.updateQuoteStatus('car123', 'workshop456', 'accepted');
      });

      // Now allows new quote request
      expect(result.current.hasQuoteSent('car123', 'workshop456')).toBe(false);

      // Can send new quote
      const newQuote: SentQuote = {
        carId: 'car123',
        workshopId: 'workshop456',
        workshopName: 'Test Workshop',
        quotationId: 'quote-second',
        timestamp: new Date(),
        status: 'submitted',
        lastUpdated: new Date(),
        retryCount: 0
      };

      act(() => {
        result.current.markQuoteSent(newQuote);
      });

      expect(result.current.hasQuoteSent('car123', 'workshop456')).toBe(true);
      expect(result.current.getQuoteStatus('car123', 'workshop456')?.quotationId).toBe('quote-second');
    });
  });

  describe('persistence', () => {
    it('should persist selectedCar to localStorage', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      const mockCar: any = {
        _id: 'car123',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
      };

      act(() => {
        result.current.setSelectedCar(mockCar);
      });

      // Check localStorage
      const stored = localStorageMock.getItem('quote-request-storage');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.selectedCar).toMatchObject({
        _id: 'car123',
        make: 'Toyota',
      });
    });

    it('should persist sentQuotes to localStorage', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      const quote: SentQuote = {
        carId: 'car123',
        workshopId: 'workshop456',
        workshopName: 'Test Workshop',
        quotationId: 'quote789',
        timestamp: new Date(),
        status: 'submitted',
      };

      act(() => {
        result.current.markQuoteSent(quote);
      });

      const stored = localStorageMock.getItem('quote-request-storage');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.state.sentQuotes).toHaveProperty('car123_workshop456');
    });

    it('should not persist sendingQuotes (transient state)', () => {
      const { result } = renderHook(() => useQuoteRequestStore());

      act(() => {
        result.current.markQuoteSending('car123', 'workshop456');
      });

      const stored = localStorageMock.getItem('quote-request-storage');
      const parsed = JSON.parse(stored!);
      expect(parsed.state.sendingQuotes).toBeUndefined();
    });
  });
});
