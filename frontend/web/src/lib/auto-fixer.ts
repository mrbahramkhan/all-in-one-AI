import { monitoring } from './monitoring';

export interface BugFix {
  name: string;
  detect: () => Promise<boolean>;
  fix: () => Promise<void>;
}

class AutoFixer {
  private fixes: BugFix[] = [];

  register(fix: BugFix) {
    this.fixes.push(fix);
  }

  async scanAndFix() {
    for (const fix of this.fixes) {
      try {
        const hasBug = await fix.detect();
        if (hasBug) {
          console.log(`[AutoFixer] Bug detected: ${fix.name}`);
          await fix.fix();
          console.log(`[AutoFixer] Fixed: ${fix.name}`);
          monitoring.logEvent('bug_fixed', { bugName: fix.name });
        }
      } catch (error) {
        console.error(`[AutoFixer] Error with ${fix.name}:`, error);
        monitoring.logError(`Auto-fix failed for ${fix.name}`, error as Error);
      }
    }
  }
}

export const autoFixer = new AutoFixer();

// Register common fixes
autoFixer.register({
  name: 'Clear Old Cache',
  detect: async () => {
    const cache = localStorage.getItem('cache-version');
    return cache !== '1.0';
  },
  fix: async () => {
    // Clear outdated cache
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('cache-')) {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem('cache-version', '1.0');
  },
});

autoFixer.register({
  name: 'Fix Auth Token',
  detect: async () => {
    const token = localStorage.getItem('auth-token');
    return token && token.length < 10; // Invalid token
  },
  fix: async () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('refresh-token');
  },
});

autoFixer.register({
  name: 'API Connection Check',
  detect: async () => {
    try {
      const response = await fetch('/api/health', { method: 'HEAD' });
      return !response.ok;
    } catch {
      return true;
    }
  },
  fix: async () => {
    console.log('[AutoFixer] Attempting API reconnection...');
    // Trigger reconnection
    window.location.reload();
  },
});

autoFixer.register({
  name: 'Memory Leak Prevention',
  detect: async () => {
    // Check if localStorage is near limit
    let size = 0;
    for (const key in localStorage) {
      size += localStorage.getItem(key)?.length || 0;
    }
    return size > 5 * 1024 * 1024; // 5MB limit
  },
  fix: async () => {
    // Clear old data
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    Object.keys(localStorage).forEach((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.timestamp && data.timestamp < thirtyDaysAgo) {
          localStorage.removeItem(key);
        }
      } catch {
        // Ignore parse errors
      }
    });
  },
});

// Run auto-fixer periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    autoFixer.scanAndFix();
  }, 600000); // Every 10 minutes
}
