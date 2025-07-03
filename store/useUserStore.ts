import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  name: string;
  hasCompletedOnboarding: boolean;
  setName: (name: string) => Promise<void>;
  setOnboardingComplete: () => Promise<void>;
  initializeStore: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  name: '',
  hasCompletedOnboarding: false,
  setName: async (name: string) => {
    await AsyncStorage.setItem('user_name', name);
    set({ name });
  },
  setOnboardingComplete: async () => {
    await AsyncStorage.setItem('has_completed_onboarding', 'true');
    set({ hasCompletedOnboarding: true });
  },
  initializeStore: async () => {
    try {
      const [name, hasCompleted] = await Promise.all([
        AsyncStorage.getItem('user_name'),
        AsyncStorage.getItem('has_completed_onboarding'),
      ]);
      
      set({
        name: name || '',
        hasCompletedOnboarding: hasCompleted === 'true',
      });
    } catch (error) {
      console.error('Error initializing user store:', error);
    }
  },
})); 