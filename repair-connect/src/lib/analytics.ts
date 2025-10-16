/**
 * Analytics Tracking System
 *
 * Supports multiple providers:
 * - Google Analytics
 * - Mixpanel
 * - Custom backend analytics
 * - Console logging (dev mode)
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp: Date;
}

type AnalyticsProvider = 'ga' | 'mixpanel' | 'backend' | 'console';

class AnalyticsManager {
  private enabled: boolean = true;
  private providers: Set<AnalyticsProvider> = new Set(['console']);
  private userId: string | null = null;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeProviders();
  }

  /**
   * Initialize analytics providers based on environment
   */
  private initializeProviders() {
    if (typeof window === 'undefined') return;

    // Production: Enable all providers
    if (process.env.NODE_ENV === 'production') {
      this.providers.add('backend');

      // Enable GA if tracking ID is configured
      if (process.env.NEXT_PUBLIC_GA_TRACKING_ID) {
        this.providers.add('ga');
      }

      // Enable Mixpanel if token is configured
      if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
        this.providers.add('mixpanel');
      }

      // Disable console in production
      this.providers.delete('console');
    }
  }

  /**
   * Set the current user ID for tracking
   */
  setUserId(userId: string | null) {
    this.userId = userId;

    // Update all providers
    if (this.providers.has('ga') && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID, {
        user_id: userId,
      });
    }

    if (this.providers.has('mixpanel') && typeof window !== 'undefined' && (window as any).mixpanel) {
      if (userId) {
        (window as any).mixpanel.identify(userId);
      } else {
        (window as any).mixpanel.reset();
      }
    }
  }

  /**
   * Track an event
   */
  track(eventName: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      },
      userId: this.userId || undefined,
      timestamp: new Date(),
    };

    // Send to all enabled providers
    this.providers.forEach((provider) => {
      this.sendToProvider(provider, event);
    });
  }

  /**
   * Send event to a specific provider
   */
  private sendToProvider(provider: AnalyticsProvider, event: AnalyticsEvent) {
    switch (provider) {
      case 'console':
        console.log('[Analytics]', event.name, event.properties);
        break;

      case 'ga':
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', event.name, event.properties);
        }
        break;

      case 'mixpanel':
        if (typeof window !== 'undefined' && (window as any).mixpanel) {
          (window as any).mixpanel.track(event.name, event.properties);
        }
        break;

      case 'backend':
        // Send to custom backend analytics endpoint
        this.sendToBackend(event).catch((error) => {
          console.error('[Analytics] Failed to send to backend:', error);
        });
        break;
    }
  }

  /**
   * Send event to backend analytics API
   */
  private async sendToBackend(event: AnalyticsEvent) {
    if (typeof window === 'undefined') return;

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
        // Don't wait for response
        keepalive: true,
      });
    } catch (error) {
      // Silently fail - analytics should never break the app
    }
  }

  /**
   * Track a page view
   */
  pageView(path: string, properties?: Record<string, any>) {
    this.track('page_view', {
      path,
      ...properties,
    });
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Singleton instance
export const analytics = new AnalyticsManager();

/**
 * Track quote request events
 */
export function trackQuoteRequest(
  event:
    | 'quote_initiated'
    | 'quote_sent'
    | 'quote_failed'
    | 'quote_viewed'
    | 'quote_received'
    | 'quote_accepted'
    | 'quote_rejected',
  properties: Record<string, any>
) {
  analytics.track(`quote_request_${event}`, {
    ...properties,
    category: 'quote_request',
  });
}

/**
 * Track user journey events
 */
export function trackUserJourney(
  step:
    | 'car_selected'
    | 'workshops_viewed'
    | 'workshop_profile_viewed'
    | 'quote_modal_opened'
    | 'quote_modal_closed',
  properties?: Record<string, any>
) {
  analytics.track(`user_journey_${step}`, {
    ...properties,
    category: 'user_journey',
  });
}

/**
 * Track errors
 */
export function trackError(
  error: Error,
  context?: Record<string, any>
) {
  analytics.track('error', {
    error_message: error.message,
    error_stack: error.stack,
    ...context,
    category: 'error',
  });
}

/**
 * Track performance metrics
 */
export function trackPerformance(
  metric: 'page_load' | 'api_request' | 'component_render',
  duration: number,
  properties?: Record<string, any>
) {
  analytics.track(`performance_${metric}`, {
    duration_ms: duration,
    ...properties,
    category: 'performance',
  });
}

/**
 * React hook for tracking page views
 */
export function useAnalyticsPageView(path: string) {
  if (typeof window !== 'undefined') {
    analytics.pageView(path);
  }
}

/**
 * Initialize analytics with user data
 */
export function initializeAnalytics(userId: string | null) {
  analytics.setUserId(userId);
}
