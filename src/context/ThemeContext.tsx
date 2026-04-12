'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { neutralTheme } from '@/themes';
import type { Theme } from '@/themes';

export type ColorSchemePreference = 'light' | 'dark' | 'system';
export type ResolvedColorScheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorSchemePreference;
  resolvedColorScheme: ResolvedColorScheme;
  setColorScheme: (value: ColorSchemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'color-scheme';
const THEME_COLOR_LIGHT = '#f5f5f7';
const THEME_COLOR_DARK = '#000000';

function systemPreference(): ResolvedColorScheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyScheme(resolved: ResolvedColorScheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolved);

  // Keep the iOS/Android PWA chrome in sync with the current surface color.
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = resolved === 'dark' ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorSchemePreference>('system');
  const [resolvedColorScheme, setResolvedColorScheme] = useState<ResolvedColorScheme>('light');

  // Hydrate from localStorage on mount; the pre-paint script has already
  // applied the attribute, so we just mirror it into React state. A single
  // post-mount sync from an external source (localStorage + matchMedia) is
  // the intended use of setState in an effect here.
  useEffect(() => {
    let stored: ColorSchemePreference = 'system';
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === 'light' || raw === 'dark' || raw === 'system') stored = raw;
    } catch {}
    const resolved: ResolvedColorScheme = stored === 'system' ? systemPreference() : stored;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColorSchemeState(stored);
    setResolvedColorScheme(resolved);
    applyScheme(resolved);
  }, []);

  // Follow live OS changes while the user is on the "system" preference.
  useEffect(() => {
    if (colorScheme !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const next: ResolvedColorScheme = mq.matches ? 'dark' : 'light';
      setResolvedColorScheme(next);
      applyScheme(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [colorScheme]);

  const setColorScheme = useCallback((value: ColorSchemePreference) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
    const resolved: ResolvedColorScheme = value === 'system' ? systemPreference() : value;
    setColorSchemeState(value);
    setResolvedColorScheme(resolved);
    applyScheme(resolved);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: neutralTheme,
        colorScheme,
        resolvedColorScheme,
        setColorScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
