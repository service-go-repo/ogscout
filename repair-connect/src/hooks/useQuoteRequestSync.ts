import { useEffect } from 'react';
import { useQuoteRequestStore, SentQuote } from '@/stores/quoteRequestStore';

/**
 * Hook to sync quote request state across browser tabs
 * and optionally sync with server on mount
 */
export function useQuoteRequestSync(options?: {
  syncWithServer?: boolean;
  userId?: string;
}) {
  const { syncWithServer = false, userId } = options || {};
  const syncFromServer = useQuoteRequestStore((state) => state.syncFromServer);

  // Tab sync via storage event
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'quote-request-storage' && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          // Zustand persist middleware handles this automatically,
          // but we can add custom logic here if needed
          console.log('[Tab Sync] Quote request state updated from another tab');
        } catch (error) {
          console.error('[Tab Sync] Failed to parse storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Server sync on mount (optional)
  useEffect(() => {
    if (syncWithServer && userId) {
      fetchServerQuotes(userId)
        .then((quotes) => {
          if (quotes && quotes.length > 0) {
            syncFromServer(quotes);
            console.log('[Server Sync] Synced', quotes.length, 'quotes from server');
          }
        })
        .catch((error) => {
          console.error('[Server Sync] Failed to sync quotes from server:', error);
        });
    }
  }, [syncWithServer, userId, syncFromServer]);
}

/**
 * Fetch sent quotes from server for the current user
 */
async function fetchServerQuotes(userId: string): Promise<SentQuote[]> {
  try {
    const response = await fetch(`/api/users/${userId}/sent-quotes`);

    if (!response.ok) {
      throw new Error(`Failed to fetch sent quotes: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success && Array.isArray(data.data)) {
      return data.data.map((quote: any) => ({
        carId: quote.carId,
        workshopId: quote.workshopId,
        workshopName: quote.workshopName || 'Unknown Workshop',
        quotationId: quote.quotationId,
        timestamp: new Date(quote.timestamp),
        status: 'submitted' as const,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching server quotes:', error);
    return [];
  }
}

/**
 * Optional WebSocket/SSE implementation for real-time server sync
 * Uncomment and adapt based on your backend infrastructure
 */
/*
export function useQuoteRequestRealtimeSync(userId: string) {
  const syncFromServer = useQuoteRequestStore((state) => state.syncFromServer);

  useEffect(() => {
    if (!userId) return;

    // Example: Server-Sent Events
    const eventSource = new EventSource(`/api/users/${userId}/quote-events`);

    eventSource.addEventListener('quote-sent', (event) => {
      try {
        const quote: SentQuote = JSON.parse(event.data);
        syncFromServer([quote]);
        console.log('[SSE] Received quote update:', quote);
      } catch (error) {
        console.error('[SSE] Failed to parse quote event:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('[SSE] Connection error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [userId, syncFromServer]);
}
*/

/**
 * Alternative WebSocket implementation
 */
/*
export function useQuoteRequestWebSocketSync(userId: string) {
  const syncFromServer = useQuoteRequestStore((state) => state.syncFromServer);

  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket(`wss://your-domain.com/api/quote-sync?userId=${userId}`);

    ws.onopen = () => {
      console.log('[WebSocket] Connected to quote sync');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'quote-sent') {
          const quote: SentQuote = message.data;
          syncFromServer([quote]);
          console.log('[WebSocket] Received quote update:', quote);
        }
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Connection error:', error);
    };

    ws.onclose = () => {
      console.log('[WebSocket] Connection closed');
    };

    return () => {
      ws.close();
    };
  }, [userId, syncFromServer]);
}
*/
