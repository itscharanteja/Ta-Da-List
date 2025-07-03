export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD format
  completedTasks: number;
  streakEarned: boolean;
}

export interface Group {
  id: string;
  name: string;
  tasks: Task[];
  streak: number;
  streakThreshold: number; // Minimum tasks needed per day for streak
  createdAt: Date;
  lastStreakDate?: string; // YYYY-MM-DD format
  dailyProgress: DailyProgress[];
}

export interface AppState {
  groups: Group[];
  isLoading: boolean;
  addGroup: (name: string, streakThreshold: number) => void;
  deleteGroup: (groupId: string) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  addTask: (groupId: string, title: string) => void;
  deleteTask: (groupId: string, taskId: string) => void;
  toggleTask: (groupId: string, taskId: string) => void;
  resetGroup: (groupId: string) => void;
  updateStreakThreshold: (groupId: string, threshold: number) => void;
}