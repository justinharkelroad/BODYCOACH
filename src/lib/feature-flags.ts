/**
 * Feature flag helpers.
 *
 * Use NEXT_PUBLIC_NEW_UI=1 (or "true") to enable the v2 design system across
 * the app. The variable is read at build time on the server and inlined into
 * the client bundle, so toggling it requires a redeploy / dev-server restart.
 */

export function isNewUI(): boolean {
  const v = process.env.NEXT_PUBLIC_NEW_UI;
  return v === '1' || v === 'true';
}
