import { create } from 'zustand';
import { Platform } from 'react-native';

interface ThemeStore {
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    border: string;
    card: string;
    error: string;
    success: string;
  };
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: true,
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
  colors: {
    background: '#000000',
    text: '#ffffff',
    primary: '#3b82f6',
    secondary: '#6b7280',
    border: '#27272a',
    card: '#18181b',
    error: '#ef4444',
    success: '#22c55e',
  },
}));