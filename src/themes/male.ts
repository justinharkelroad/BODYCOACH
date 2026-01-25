import type { Theme } from './types';

export const maleTheme: Theme = {
  name: 'male',

  colors: {
    // Backgrounds - Cooler, slightly darker
    background: '#F8FAFB', // Cool off-white
    backgroundAlt: '#F0F4F6',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',

    // Primary - Slate teal
    primary: '#5B8A8A', // Sophisticated teal
    primaryLight: '#7AACAC',
    primaryDark: '#4A7272',

    // Secondary - Deep slate blue
    secondary: '#4A6B8A',
    secondaryLight: '#6B8CAC',
    secondaryDark: '#3A5570',

    // Accent - Cool silver/steel
    accent: '#8A9BAC',
    accentLight: '#B8C4D0',
    accentDark: '#6A7B8C',

    // Semantic
    success: '#5B9A7B', // Forest green
    warning: '#C9A848', // Amber
    error: '#B85A5A', // Muted red
    info: '#5A8AB8', // Steel blue

    // Text
    text: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textMuted: '#7A7A7A',
    textOnPrimary: '#FFFFFF',

    // Borders
    border: '#E0E4E8',
    divider: '#EEF0F2',
  },

  gradients: {
    hero: 'linear-gradient(135deg, #F0F4F6 0%, #E4ECF0 100%)',
    card: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFB 100%)',
    progress: 'linear-gradient(90deg, #5B8A8A 0%, #4A6B8A 100%)',
    achievement: 'linear-gradient(135deg, #8A9BAC 0%, #6A7B8C 100%)',
  },

  shadows: {
    sm: '0 2px 8px rgba(90, 138, 138, 0.10)',
    md: '0 4px 16px rgba(90, 138, 138, 0.14)',
    lg: '0 8px 32px rgba(90, 138, 138, 0.18)',
  },

  typography: {
    fontFamily: {
      heading: 'DM Sans',
      body: 'Inter',
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
    },
  },

  copy: {
    onboarding: {
      welcome: "Let's get you set up",
      goalLoseFat: 'Cut fat, keep muscle',
      goalMaintain: 'Stay on track',
      goalGain: 'Build mass efficiently',
    },
    dashboard: {
      greeting: (name: string, time: 'morning' | 'afternoon' | 'evening') => {
        if (time === 'morning') return `Morning, ${name}`;
        if (time === 'afternoon') return `${name}`;
        return `Evening, ${name}`;
      },
      caloriesRemaining: 'calories remaining',
      overTarget: 'over target',
      streakMessage: (days: number) => `${days} day streak`,
    },
    achievements: {
      firstLog: 'First log complete',
      weekStreak: '7 days consistent',
      monthStreak: '30 days locked in',
    },
    encouragement: [
      'Solid progress',
      'Stay consistent',
      'One day at a time',
      'Keep showing up',
      'Trust the process',
    ],
  },

  showPregnancyScreens: false,
};
