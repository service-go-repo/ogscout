/**
 * Production Monitoring and Logging System
 *
 * Features:
 * - Structured logging
 * - Performance monitoring
 * - Error tracking
 * - Custom metrics
 * - Integration with external services (Sentry, LogRocket, etc.)
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

class MonitoringService {
  private sessionId: string;
  private userId: string | null = null;
  private logBuffer: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private isProduction: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = process.env.NODE_ENV === 'production';

    if (this.isProduction) {
      this.startBufferFlush();
    }

    // Initialize Sentry if configured
    this.initializeSentry();
  }

  /**
   * Initialize Sentry for error tracking
   */
  private initializeSentry() {
    if (typeof window === 'undefined') return;

    // Sentry is typically initialized in _app.tsx
    // This is a placeholder for additional configuration
    if ((window as any).Sentry && this.userId) {
      (window as any).Sentry.setUser({
        id: this.userId,
        sessionId: this.sessionId,
      });
    }
  }

  /**
   * Set current user ID for tracking
   */
  setUser(userId: string | null) {
    this.userId = userId;

    if ((window as any).Sentry && userId) {
      (window as any).Sentry.setUser({ id: userId });
    }
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: Record<string, any>) {
    this.log('debug', message, data);
  }

  /**
   * Log an info message
   */
  info(message: string, data?: Record<string, any>) {
    this.log('info', message, data);
  }

  /**
   * Log a warning
   */
  warn(message: string, data?: Record<string, any>) {
    this.log('warn', message, data);
  }

  /**
   * Log an error
   */
  error(message: string, error?: Error | Record<string, any>) {
    const data =
      error instanceof Error
        ? {
            error_message: error.message,
            error_stack: error.stack,
          }
        : error;

    this.log('error', message, data);

    // Send to Sentry
    if ((window as any).Sentry && error instanceof Error) {
      (window as any).Sentry.captureException(error, {
        extra: { message, ...data },
      });
    }
  }

  /**
   * Log a fatal error
   */
  fatal(message: string, error?: Error | Record<string, any>) {
    const data =
      error instanceof Error
        ? {
            error_message: error.message,
            error_stack: error.stack,
          }
        : error;

    this.log('fatal', message, data);

    // Send to Sentry as fatal
    if ((window as any).Sentry && error instanceof Error) {
      (window as any).Sentry.captureException(error, {
        level: 'fatal' as any,
        extra: { message, ...data },
      });
    }
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, data?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    };

    // Console log in development
    if (!this.isProduction) {
      const consoleMethod = level === 'debug' ? 'log' : level === 'fatal' ? 'error' : level;
      console[consoleMethod](`[${level.toUpperCase()}]`, message, data || '');
    }

    // Buffer log in production
    if (this.isProduction) {
      this.logBuffer.push(entry);

      // Flush immediately for errors and fatals
      if (level === 'error' || level === 'fatal') {
        this.flushLogs();
      }
    }
  }

  /**
   * Start periodic log buffer flush
   */
  private startBufferFlush() {
    // Flush logs every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushLogs();
    }, 30000);
  }

  /**
   * Flush log buffer to server
   */
  private async flushLogs() {
    if (this.logBuffer.length === 0) return;

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    try {
      await fetch('/api/monitoring/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs }),
        // Don't wait for response
        keepalive: true,
      });
    } catch (error) {
      // Silently fail - don't want logging to break the app
      console.error('Failed to flush logs:', error);
    }
  }

  /**
   * Track a performance metric
   */
  trackPerformance(metric: string, duration: number, data?: Record<string, any>) {
    this.info(`Performance: ${metric}`, {
      ...data,
      duration_ms: duration,
      metric_type: 'performance',
    });

    // Send to performance monitoring service
    if ((window as any).performance?.mark) {
      (window as any).performance.mark(metric);
    }
  }

  /**
   * Track a custom metric
   */
  trackMetric(name: string, value: number, unit: string = 'count', data?: Record<string, any>) {
    this.info(`Metric: ${name}`, {
      ...data,
      metric_name: name,
      metric_value: value,
      metric_unit: unit,
      metric_type: 'custom',
    });
  }

  /**
   * Track API request performance
   */
  trackAPIRequest(
    endpoint: string,
    method: string,
    status: number,
    duration: number,
    error?: Error
  ) {
    const data = {
      endpoint,
      method,
      status,
      duration_ms: duration,
      metric_type: 'api_request',
    };

    if (error) {
      this.error(`API Error: ${method} ${endpoint}`, {
        ...data,
        error_message: error.message,
      });
    } else {
      this.info(`API Request: ${method} ${endpoint}`, data);
    }
  }

  /**
   * Create a performance timer
   */
  startTimer(label: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.trackPerformance(label, duration);
    };
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up on unmount
   */
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushLogs();
  }
}

// Singleton instance
export const monitoring = new MonitoringService();

/**
 * Helper to wrap async functions with performance tracking
 */
export function withPerformanceTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  label: string
): T {
  return (async (...args: any[]) => {
    const endTimer = monitoring.startTimer(label);
    try {
      const result = await fn(...args);
      endTimer();
      return result;
    } catch (error) {
      endTimer();
      monitoring.error(`Error in ${label}`, error as Error);
      throw error;
    }
  }) as T;
}

/**
 * Helper to wrap API calls with monitoring
 */
export async function monitoredFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const method = init?.method || 'GET';
  const startTime = performance.now();

  try {
    const response = await fetch(input, init);
    const duration = performance.now() - startTime;

    monitoring.trackAPIRequest(url, method, response.status, duration);

    return response;
  } catch (error) {
    const duration = performance.now() - startTime;
    monitoring.trackAPIRequest(url, method, 0, duration, error as Error);
    throw error;
  }
}

/**
 * Initialize monitoring with user data
 */
export function initializeMonitoring(userId: string | null) {
  monitoring.setUser(userId);
}
