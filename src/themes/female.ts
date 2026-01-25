import type { Theme } from './types';

export const femaleTheme: Theme = {
  name: 'female',

  colors: {
    // Backgrounds
    background: '#FFFBF8', // Warm cream
    backgroundAlt: '#FFF5EE', // Soft peach undertone
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',

    // Primary - Soft lavender/mauve
    primary: '#B8A9D4', // Lavender
    primaryLight: '#D4C9E8',
    primaryDark: '#9A8BB8',

    // Secondary - Warm rose
    secondary: '#E8B4B8', // Dusty rose
    secondaryLight: '#F5D4D6',
    secondaryDark: '#C99498',

    // Accent - Warm gold (achievements, highlights)
    accent: '#D4A853',
    accentLight: '#E8D4A8',
    accentDark: '#B8923D',

    // Semantic
    success: '#7DB89A', // Soft sage green
    warning: '#E8C468', // Warm amber
    error: '#D4787A', // Muted coral
    info: '#8AAED4', // Soft sky

    // Text
    text: '#2D2D2D',
    textSecondary: '#6B6B6B',
    textMuted: '#9B9B9B',
    textOnPrimary: '#FFFFFF',

    // Borders & Dividers
    border: '#E8E4E0',
    divider: '#F0EBE6',
  },

  gradients: {
    hero: 'linear-gradient(135deg, #FFF5EE 0%, #F5E6E8 50%, #E8E4F0 100%)',
    card: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBF8 100%)',
    progress: 'linear-gradient(90deg, #B8A9D4 0%, #E8B4B8 100%)',
    achievement: 'linear-gradient(135deg, #D4A853 0%, #E8C468 100%)',
  },

  shadows: {
    sm: '0 2px 8px rgba(184, 169, 212, 0.12)',
    md: '0 4px 16px rgba(184, 169, 212, 0.16)',
    lg: '0 8px 32px rgba(184, 169, 212, 0.20)',
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
      welcome: "Let's build something beautiful together",
      goalLoseFat: 'Feel confident in your body',
      goalMaintain: 'Nourish yourself sustainably',
      goalGain: 'Build strength your way',
    },
    dashboard: {
      greeting: (name: string, time: 'morning' | 'afternoon' | 'evening') => {
        if (time === 'morning') return `Good morning, ${name}`;
        if (time === 'afternoon') return `Hey ${name}, how's your day?`;
        return `Evening, ${name}`;
      },
      caloriesRemaining: 'calories left to nourish yourself',
      overTarget: "a little over - and that's okay",
      streakMessage: (days: number) => `${days} days of showing up for yourself`,
    },
    achievements: {
      firstLog: 'First step taken!',
      weekStreak: 'A whole week of consistency',
      monthStreak: 'One month strong!',
    },
    encouragement: [
      "You're doing amazing",
      "Progress isn't always linear",
      'Every small choice matters',
      "You showed up today - that's everything",
      'Be patient with yourself',
    ],
  },

  showPregnancyScreens: true,
};
