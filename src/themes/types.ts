// Theme type definitions

export type Gender = 'female' | 'male' | 'neutral';

export interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceElevated: string;

  // Primary
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Secondary
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;

  // Accent
  accent: string;
  accentLight: string;
  accentDark: string;

  // Semantic
  success: string;
  warning: string;
  error: string;
  info: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textOnPrimary: string;

  // Borders & Dividers
  border: string;
  divider: string;
}

export interface ThemeGradients {
  hero: string;
  card: string;
  progress: string;
  achievement: string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
}

export interface ThemeTypography {
  fontFamily: {
    heading: string;
    body: string;
  };
  weights: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
  };
}

export interface ThemeCopy {
  onboarding: {
    welcome: string;
    goalLoseFat: string;
    goalMaintain: string;
    goalGain: string;
  };
  dashboard: {
    greeting: (name: string, time: 'morning' | 'afternoon' | 'evening') => string;
    caloriesRemaining: string;
    overTarget: string;
    streakMessage: (days: number) => string;
  };
  achievements: {
    firstLog: string;
    weekStreak: string;
    monthStreak: string;
  };
  encouragement: string[];
}

export interface Theme {
  name: Gender;
  colors: ThemeColors;
  gradients: ThemeGradients;
  shadows: ThemeShadows;
  typography: ThemeTypography;
  copy: ThemeCopy;
  showPregnancyScreens: boolean;
}
