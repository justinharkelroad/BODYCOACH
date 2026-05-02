import type { CSSProperties, ReactNode } from 'react';

/**
 * Inline overrides keep theme-variable-driven legacy components rendering
 * with light surfaces inside the v2 shell, regardless of the user's stored
 * color-scheme preference. Without these, a user in dark mode sees black
 * cards floating on the pastel aurora gradient.
 */
const lightThemeOverrides: CSSProperties = {
  ['--theme-bg' as string]: '#F4F6FB',
  ['--theme-bg-alt' as string]: '#FFFFFF',
  ['--theme-surface' as string]: '#FFFFFF',
  ['--theme-surface-elevated' as string]: '#FFFFFF',
  ['--theme-text' as string]: '#1d1d1f',
  ['--theme-text-secondary' as string]: '#6e6e73',
  ['--theme-text-muted' as string]: '#9BA3A9',
  ['--theme-text-on-primary' as string]: '#FFFFFF',
  ['--theme-border' as string]: 'rgba(0, 0, 0, 0.08)',
  ['--theme-divider' as string]: '#F0F4F9',
  ['--theme-glass-bg' as string]: 'rgba(255, 255, 255, 0.85)',
  ['--theme-hover-subtle' as string]: 'rgba(0, 0, 0, 0.04)',
  colorScheme: 'light',
};

export function AuroraBackground({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#F4F6FB]"
      style={lightThemeOverrides}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] blur-3xl"
        style={{
          background:
            'radial-gradient(60% 80% at 20% 20%, #FFD9C2 0%, transparent 60%),' +
            'radial-gradient(50% 70% at 80% 10%, #D9C8FF 0%, transparent 60%),' +
            'radial-gradient(70% 60% at 50% 70%, #FFE7B3 0%, transparent 60%),' +
            'radial-gradient(60% 60% at 90% 60%, #BEE3FF 0%, transparent 60%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
