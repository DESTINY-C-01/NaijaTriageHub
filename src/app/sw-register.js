'use client';

import { useEffect } from 'react';

/**
 * Registers public/sw.js on mount. Kept as its own tiny client component
 * so that layout.js can stay a server component (needed for the
 * `metadata` export) while still running client-side registration logic.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // eslint-disable-next-line no-console
        console.log('[NaijaTriageHub] Service worker registered:', registration.scope);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('[NaijaTriageHub] Service worker registration failed:', err);
      });
  }, []);

  return null;
}