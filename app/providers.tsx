'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { baseUrl } from '@/lib/http/baseQuery';

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const healthUrl = baseUrl.endsWith('/health')
      ? baseUrl
      : `${baseUrl.replace(/\/$/, '')}/health`;

    const ping = async () => {
      try {
        await fetch(healthUrl, {
          method: 'GET',
          credentials: 'include',
        });
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Keep-alive ping failed', error);
        }
      }
    };

    // Initial ping, then interval
    ping();
    const intervalId = setInterval(ping, 1 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [baseUrl]);

  return <Provider store={store}>{children}</Provider>;
}