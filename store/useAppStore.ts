import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppState, Group, Task, DailyProgress } from '../types';

// Storage key
const STORAGE_KEY = 'tada-list-data';

// Create unique ID
const createId = () => Math.random().toString(36).substr(2, 9);

// Get today's date in YYYY-MM-DD format
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Get yesterday's date in YYYY-MM-DD format
const getYesterdayString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

// Check if two dates are consecutive days
const areConsecutiveDays = (date1: string, date2: string) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

// Calculate and update streak for a group
const updateGroupStreak = (group: Group): Group => {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  
  // Count today's completed tasks
  const todayCompletedTasks = group.tasks.filter(task => {
    if (!task.completed || !task.completedAt) return false;
    const taskDate = task.completedAt.toISOString().split('T')[0];
    return taskDate === today;
  }).length;

  // Find or create today's progress entry
  let todayProgress = group.dailyProgress.find(p => p.date === today);
  if (!todayProgress) {
    todayProgress = {
      date: today,
      completedTasks: todayCompletedTasks,
      streakEarned: false,
    };
    group.dailyProgress.push(todayProgress);
  } else {
    todayProgress.completedTasks = todayCompletedTasks;
  }

  // Check if today qualifies for a streak
  const todayQualifies = todayCompletedTasks >= group.streakThreshold;
  
  if (todayQualifies && !todayProgress.streakEarned) {
    // Check if we should continue or start a new streak
    if (group.lastStreakDate) {
      if (group.lastStreakDate === yesterday) {
        // Continue streak
        group.streak += 1;
      } else if (group.lastStreakDate === today) {
        // Already counted today, do nothing
      } else {
        // Gap in streak, start new streak
        group.streak = 1;
      }
    } else {
      // First streak
      group.streak = 1;
    }
    
    group.lastStreakDate = today;
    todayProgress.streakEarned = true;
  } else if (!todayQualifies && group.lastStreakDate === today) {
    // Today no longer qualifies, remove today's streak
    todayProgress.streakEarned = false;
    
    // Find the last qualifying day before today
    const sortedProgress = group.dailyProgress
      .filter(p => p.streakEarned && p.date !== today)
      .sort((a, b) => b.date.localeCompare(a.date));
    
    if (sortedProgress.length > 0) {
      group.lastStreakDate = sortedProgress[0].date;
      // Recalculate streak from the last qualifying day
      let consecutiveDays = 0;
      for (const progress of sortedProgress) {
        if (consecutiveDays === 0 || areConsecutiveDays(progress.date, sortedProgress[consecutiveDays - 1].date)) {
          consecutiveDays++;
        } else {
          break;
        }
      }
      group.streak = consecutiveDays;
    } else {
      group.streak = 0;
      group.lastStreakDate = undefined;
    }
  }

  // Clean up old progress entries (keep last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
  
  group.dailyProgress = group.dailyProgress.filter(p => p.date >= cutoffDate);

  return group;
};

export const useAppStore = create<AppState>((set, get) => {
  // Load the data immediately
  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects and ensure new fields exist
        const groups = parsed.map((group: any) => ({
          ...group,
          streakThreshold: group.streakThreshold || 1, // Default to 1 if not set
          dailyProgress: group.dailyProgress || [],
          createdAt: new Date(group.createdAt),
          tasks: group.tasks.map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          })),
        }));
        set({ groups, isLoading: false });
      } else {
        set({ groups: [], isLoading: false });
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
      set({ groups: [], isLoading: false });
    }
  };

  // Start loading
  loadData();

  return {
    groups: [],
    isLoading: true,

    addGroup: async (name: string, streakThreshold: number = 1) => {
      const newGroup: Group = {
        id: createId(),
        name,
        tasks: [],
        streak: 0,
        streakThreshold: Math.max(1, streakThreshold), // Ensure minimum of 1
        createdAt: new Date(),
        dailyProgress: [],
      };

      set((state) => {
        const newGroups = [...state.groups, newGroup];
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newGroups))
          .catch(error => console.error('Error saving data:', error));
        return { groups: newGroups };
      });
    },

    deleteGroup: async (groupId: string) => {
      set((state) => {
        const newGroups = state.groups.filter(group => group.id !== groupId);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newGroups))
          .catch(error => console.error('Error saving data:', error));
        return { groups: newGroups };
      });
    },

    updateGroup: async (groupId: string, updates: Partial<Group>) => {
      set((state) => {
        const newGroups = state.groups.map(group =>
          group.id === groupId ? { ...group, ...updates } : group
        );
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newGroups))
          .catch(error => console.error('Error saving data:', error));
        return { groups: newGroups };
      });
    },

    updateStreakThreshold: async (groupId: string, threshold: number) => {
      set((state) => {
        const newGroups = state.groups.map(group => {
          if (group.id === groupId) {
            const updatedGroup = { 
              ...group, 
              streakThreshold: Math.max(1, threshold) 
            };
            return updateGroupStreak(updatedGroup);
          }
          return group;
        });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newGroups))
          .catch(error => console.error('Error saving data:', error));
        return { groups: newGroups };
      });
    },

    resetGroup: async (groupId: string) => {
      set((state) => {
        const newGroups = state.groups.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              streak: 0,
              lastStreakDate: undefined,
              tasks: group.tasks.map(task => ({ ...task, completed: false, completedAt: undefined })),
              dailyProgress: [],
            };
          }
          return group;
        });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newGroups))
          .catch(error => console.error('Error saving data:', error));
        return { groups: newGroups };
      });
    },

    addTask: async (groupId: string, title: string) => {
      const newTask: Task = {
        id: createId(),
        title,
        completed: false,
        createdAt: new Date(),
      };

      set((state) => {
        const newGroups = state.groups.map(group => {
          if (group.id === groupId) {
            const updatedGroup = {
              ...group,
              tasks: [...group.tasks, newTask],
            };
            return updateGroupStreak(updatedGroup);
          }
          return group;
        });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newGroups))
          .catch(error => console.error('Error saving data:', error));
        return { groups: newGroups };
      });
    },

    toggleTask: async (groupId: string, taskId: string) => {
      set((state) => {
        const newGroups = state.groups.map(group => {
          if (group.id === groupId) {
            const updatedGroup = {
              ...group,
              tasks: group.tasks.map(task => {
                if (task.id === taskId) {
                  return {
                    ...task,
                    completed: !task.completed,
                    completedAt: !task.completed ? new Date() : undefined,
                  };
                }
                return task;
              }),
            };
            return updateGroupStreak(updatedGroup);
          }
          return group;
        });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newGroups))
          .catch(error => console.error('Error saving data:', error));
        return { groups: newGroups };
      });
    },

    deleteTask: async (groupId: string, taskId: string) => {
      set((state) => {
        const newGroups = state.groups.map(group => {
          if (group.id === groupId) {
            const updatedGroup = {
              ...group,
              tasks: group.tasks.filter(task => task.id !== taskId),
            };
            return updateGroupStreak(updatedGroup);
          }
          return group;
        });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newGroups))
          .catch(error => console.error('Error saving data:', error));
        return { groups: newGroups };
      });
    },
  };
});