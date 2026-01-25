import type { Theme } from './types';

export const neutralTheme: Theme = {
  name: 'neutral',

  colors: {
    // Backgrounds - Neutral foundation
    background: '#FAFAFA',
    backgroundAlt: '#F5F5F0',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',

    // Primary - Sophisticated slate
    primary: '#7C8B9A',
    primaryLight: '#A8B5C4',
    primaryDark: '#5C6B7A',

    // Secondary - Warm slate
    secondary: '#8A9098',
    secondaryLight: '#B0B5BC',
    secondaryDark: '#6A7078',

    // Accent - Warm gold (universal energy, achievement)
    accent: '#D4A853',
    accentLight: '#E8D4A8',
    accentDark: '#B8923D',

    // Semantic
    success: '#7BC47F',
    warning: '#F5A623',
    error: '#E57373',
    info: '#64B5F6',

    // Text
    text: '#2D3436',
    textSecondary: '#636E72',
    textMuted: '#9BA3A9',
    textOnPrimary: '#FFFFFF',

    // Borders & Dividers
    border: '#E8E4E0',
    divider: '#F0EBE6',
  },

  gradients: {
    hero: 'linear-gradient(135deg, #F5F5F0 0%, #E8E4DD 100%)',
    card: 'linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)',
    progress: 'linear-gradient(90deg, #7C8B9A 0%, #D4A853 100%)',
    achievement: 'linear-gradient(135deg, #D4A853 0%, #E8D4A8 100%)',
  },

  shadows: {
    sm: '0 2px 8px rgba(124, 139, 154, 0.10)',
    md: '0 4px 16px rgba(124, 139, 154, 0.14)',
    lg: '0 8px 32px rgba(124, 139, 154, 0.18)',
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
      welcome: "Let's personalize your experience",
      goalLoseFat: 'Reduce body fat',
      goalMaintain: 'Maintain your current weight',
      goalGain: 'Build muscle and strength',
    },
    dashboard: {
      greeting: (name: string, time: 'morning' | 'afternoon' | 'evening') => {
        if (time === 'morning') return `Good morning, ${name}`;
        if (time === 'afternoon') return `Good afternoon, ${name}`;
        return `Good evening, ${name}`;
      },
      caloriesRemaining: 'calories remaining',
      overTarget: 'over target',
      streakMessage: (days: number) => `${days} day streak`,
    },
    achievements: {
      firstLog: 'First log complete!',
      weekStreak: '7-day streak!',
      monthStreak: '30-day streak!',
    },
    encouragement: [
      'Great progress',
      'Keep it up',
      'Stay consistent',
      'One step at a time',
      'You got this',
    ],
  },

  showPregnancyScreens: false,
};
