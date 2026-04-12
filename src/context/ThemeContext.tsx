'use client';

import { createContext, useContext, ReactNode } from 'react';
import { neutralTheme } from '@/themes';
import type { Theme } from '@/themes';

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: neutralTheme }}>
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
