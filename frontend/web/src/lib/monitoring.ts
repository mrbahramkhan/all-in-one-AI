// Error and performance monitoring
export const errorMonitor = {
  log: (error: any, context?: string) => {
    const msg = `[ERROR${context ? ` - ${context}` : ''}] ${error?.message || String(error)}`;
    console.error(msg);
    if (typeof window !== 'undefined') {
      // Send to monitoring service in production
      navigator.sendBeacon?.('/api/monitoring/errors', JSON.stringify({ error: msg, context, timestamp: new Date().toISOString() }));
    }
  },
  warn: (message: string, context?: string) => {
    console.warn(`[WARN${context ? ` - ${context}` : ''}] ${message}`);
  },
  info: (message: string, context?: string) => {
    console.info(`[INFO${context ? ` - ${context}` : ''}] ${message}`);
  },
};

export const performanceMonitor = {
  startTimer: (label: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${label}-start`);
    }
  },
  endTimer: (label: string) => {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${label}-end`);
      try {
        performance.measure(label, `${label}-start`, `${label}-end`);
        const measure = performance.getEntriesByName(label)[0];
        console.log(`[PERF] ${label}: ${(measure as PerformanceMeasure).duration.toFixed(2)}ms`);
      } catch (e) {
        console.log(`[PERF] ${label}: measured`);
      }
    }
  },
};
