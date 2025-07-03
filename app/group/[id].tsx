import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus, Settings } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { useThemeStore } from '../../store/useThemeStore';
import { TaskItem } from '../../components/TaskItem';
import { AddTaskModal } from '../../components/AddTaskModal';
import { GroupSettingsModal } from '../../components/GroupSettingsModal';
import { ProgressBar } from '../../components/ProgressBar';
import { ConfettiAnimation } from '../../components/ConfettiAnimation';
import { TadaAnimation } from '../../components/TadaAnimation';
import { ThemeToggle } from '../../components/ThemeToggle';
import { MotiView } from 'moti';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { groups, addTask, deleteTask, toggleTask, updateStreakThreshold } = useAppStore();
  const { isDark } = useThemeStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastProgress, setLastProgress] = useState(0);
  const insets = useSafeAreaInsets();

  const group = groups.find(g => g.id === id);

  if (!group) {
    const styles = getStyles(isDark, insets);
    return (
      <View style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Group not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.goBackButton}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Get today's completed tasks
  const today = new Date().toISOString().split('T')[0];
  const todayCompletedTasks = group.tasks.filter(task => {
    if (!task.completed || !task.completedAt) return false;
    const taskDate = task.completedAt.toISOString().split('T')[0];
    return taskDate === today;
  }).length;

  const totalTasks = group.tasks.length;
  const overallProgress = totalTasks > 0 ? group.tasks.filter(t => t.completed).length / totalTasks : 0;
  const streakProgress = group.streakThreshold > 0 ? todayCompletedTasks / group.streakThreshold : 0;
  const todayStreakComplete = todayCompletedTasks >= group.streakThreshold;

  // Trigger celebration when daily streak goal is reached
  React.useEffect(() => {
    if (streakProgress >= 1 && lastProgress < 1 && group.streakThreshold > 0) {
      setShowCelebration(true);
    }
    setLastProgress(streakProgress);
  }, [streakProgress, lastProgress, group.streakThreshold]);

  const handleAddTask = (title: string) => {
    addTask(group.id, title);
  };

  const handleToggleTask = (taskId: string) => {
    toggleTask(group.id, taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTask(group.id, taskId),
        },
      ]
    );
  };

  const styles = getStyles(isDark, insets);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={isDark ? '#d1d5db' : '#374151'} />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <ThemeToggle />
              <TouchableOpacity
                onPress={() => setShowSettings(true)}
                style={styles.settingsButton}
              >
                <Settings size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={styles.addButton}
              >
                <Plus size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 150 }}
          >
            <Text style={styles.title}>{group.name}</Text>

            <View style={styles.progressSection}>
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  Today: {todayCompletedTasks} of {group.streakThreshold} for streak
                </Text>
                {group.streak > 0 && (
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakText}>🔥 {group.streak} days</Text>
                  </View>
                )}
              </View>
              <ProgressBar progress={Math.min(streakProgress, 1)} height={12} />
              
              <Text style={styles.totalTasksText}>
                Total: {group.tasks.filter(t => t.completed).length} of {totalTasks} tasks completed
              </Text>
            </View>
          </MotiView>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {group.tasks.length === 0 ? (
            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
              style={styles.emptyState}
            >
              <Text style={styles.emptyTitle}>No tasks yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first task to start building your daily habit
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={styles.createButton}
              >
                <Text style={styles.createButtonText}>Add First Task</Text>
              </TouchableOpacity>
            </MotiView>
          ) : (
            <>
              {todayStreakComplete && (
                <MotiView
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                  style={styles.completeBanner}
                >
                  <Text style={styles.completeText}>
                    🎉 Daily goal achieved! Keep the streak going!
                  </Text>
                </MotiView>
              )}

              {group.tasks.map((task, index) => (
                <MotiView
                  key={task.id}
                  from={{ opacity: 0, translateX: -30 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ 
                    type: 'spring', 
                    damping: 15, 
                    stiffness: 150,
                    delay: index * 100 
                  }}
                >
                  <TaskItem
                    task={task}
                    onToggle={() => handleToggleTask(task.id)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                </MotiView>
              ))}
            </>
          )}
        </ScrollView>
      </View>

      {/* Modals */}
      <View style={styles.modalsContainer}>
        <AddTaskModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTask}
        />

        <GroupSettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          group={group}
          onUpdateStreakThreshold={updateStreakThreshold}
        />
      </View>

      {showCelebration && (
        <ConfettiAnimation
          trigger={true}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </View>
  );
}

const getStyles = (isDark: boolean, insets: { top: number; bottom: number; left: number; right: number }) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#111827' : '#f9fafb',
    paddingTop: Platform.OS === 'android' ? insets.top : 0,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: isDark ? '#1f2937' : 'white',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    padding: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDark ? '#f9fafb' : '#111827',
    marginBottom: 16,
  },
  progressSection: {
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    color: isDark ? '#d1d5db' : '#4b5563',
  },
  streakBadge: {
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    color: isDark ? '#d1d5db' : '#4b5563',
    fontWeight: '500',
  },
  totalTasksText: {
    color: isDark ? '#9ca3af' : '#6b7280',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: insets.bottom + 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: isDark ? '#6b7280' : '#9ca3af',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: isDark ? '#9ca3af' : '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  completeBanner: {
    backgroundColor: isDark ? '#065f46' : '#d1fae5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  completeText: {
    color: isDark ? '#a7f3d0' : '#047857',
    textAlign: 'center',
    fontWeight: '500',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 20,
    fontWeight: '500',
    color: isDark ? '#9ca3af' : '#6b7280',
    marginBottom: 16,
  },
  goBackButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  goBackButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
});