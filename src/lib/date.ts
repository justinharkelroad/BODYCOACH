/**
 * Return YYYY-MM-DD for `date` in the runtime's local timezone.
 *
 * Use this on the CLIENT, where local-TZ == user's browser timezone.
 * Do NOT use `new Date().toISOString().split('T')[0]` — that converts to UTC
 * first, so users west of UTC see tomorrow's date after ~4pm local.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Return YYYY-MM-DD for `date` as observed in the given IANA timezone
 * (e.g. `America/Los_Angeles`). Use this on the SERVER, where the runtime
 * is UTC and we need the user's local civil date.
 */
export function getDateStringInTimezone(
  timezone: string,
  date: Date = new Date(),
): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return getLocalDateString(date);
  }
}
