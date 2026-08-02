import { useState, useCallback } from 'react';
import { errorMonitor } from '@/lib/monitoring';

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err as Error);
      setStatus('error');
      errorMonitor.log(err, 'useAsync');
    }
  }, [asyncFunction]);

  useState(() => {
    if (immediate) execute();
  });

  return { execute, status, data, error };
}

export function useFetch<T>(url: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err as Error);
      errorMonitor.log(err, `useFetch(${url})`);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  return { fetch_, data, loading, error };
}
