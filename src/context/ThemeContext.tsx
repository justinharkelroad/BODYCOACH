'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { femaleTheme, maleTheme, neutralTheme } from '@/themes';
import type { Gender, Theme } from '@/themes';

interface ThemeContextType {
  theme: Theme;
  gender: Gender;
  setGender: (gender: Gender) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'bodycoach-gender';

function getThemeByGender(gender: Gender): Theme {
  switch (gender) {
    case 'female':
      return femaleTheme;
    case 'male':
      return maleTheme;
    default:
      return neutralTheme;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [gender, setGenderState] = useState<Gender>('neutral');
  const [mounted, setMounted] = useState(false);

  // Load gender from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'female' || stored === 'male' || stored === 'neutral')) {
      setGenderState(stored as Gender);
    }
    setMounted(true);
  }, []);

  // Update data-theme attribute on html element
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', gender);
    }
  }, [gender, mounted]);

  const setGender = (newGender: Gender) => {
    setGenderState(newGender);
    localStorage.setItem(STORAGE_KEY, newGender);
    document.documentElement.setAttribute('data-theme', newGender);
  };

  const theme = getThemeByGender(gender);

  // Prevent flash by not rendering until mounted
  // The CSS will handle the theme via data-theme attribute
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: neutralTheme, gender: 'neutral', setGender }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, gender, setGender }}>
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
