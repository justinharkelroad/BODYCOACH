'use client';

import { useEffect } from 'react';

const LAST_SYNCED_KEY = 'bc.tzSynced';

/**
 * Keeps `profiles.timezone` in sync with the user's browser timezone.
 * Runs once per browser on mount; updates on change (travel, DST-at-edge).
 * Silent best-effort — never blocks the UI.
 */
export function TimezoneSync() {
  useEffect(() => {
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!browserTz) return;

    let lastSynced: string | null = null;
    try {
      lastSynced = localStorage.getItem(LAST_SYNCED_KEY);
    } catch {
      // localStorage unavailable (private mode, etc.) — fall through to PUT
    }
    if (lastSynced === browserTz) return;

    fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone: browserTz }),
    })
      .then((res) => {
        if (res.ok) {
          try {
            localStorage.setItem(LAST_SYNCED_KEY, browserTz);
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // network error — try again next session
      });
  }, []);

  return null;
}
