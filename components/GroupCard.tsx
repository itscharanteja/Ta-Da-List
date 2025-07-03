import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MoveVertical as MoreVertical, Trash2, RotateCcw, Settings } from 'lucide-react-native';
import { ProgressBar } from './ProgressBar';
import { ConfettiAnimation } from './ConfettiAnimation';
import { TadaAnimation } from './TadaAnimation';
import { GroupSettingsModal } from './GroupSettingsModal';
import { useThemeStore } from '../store/useThemeStore';
import type { Group } from '../types';
import { MotiView } from 'moti';

interface GroupCardProps {
  group: Group;
  onDelete: (groupId: string) => void;
  onReset: (groupId: string) => void;
  onUpdateStreakThreshold: (groupId: string, threshold: number) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onDelete,
  onReset,
  onUpdateStreakThreshold,
}) => {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lastProgress, setLastProgress] = useState(0);

  // Get today's completed tasks
  const today = new Date().toISOString().split('T')[0];
  const todayCompletedTasks = group.tasks.filter(task => {
    if (!task.completed || !task.completedAt) return false;
    const taskDate = task.completedAt.toISOString().split('T')[0];
    return taskDate === today;
  }).length;

  const totalTasks = group.tasks.length;
  const progress = totalTasks > 0 ? todayCompletedTasks / totalTasks : 0;
  const streakProgress = group.streakThreshold > 0 ? todayCompletedTasks / group.streakThreshold : 0;
  const todayStreakComplete = todayCompletedTasks >= group.streakThreshold;

  // Trigger celebration when daily streak goal is reached
  useEffect(() => {
    if (streakProgress >= 1 && lastProgress < 1 && group.streakThreshold > 0) {
      setShowCelebration(true);
    }
    setLastProgress(streakProgress);
  }, [streakProgress, lastProgress, group.streakThreshold]);

  const handlePress = () => {
    setShowMenu(false); // Close menu when navigating
    router.push(`/group/${group.id}`);
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group.name}"? This action cannot be undone.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => setShowMenu(false)
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setShowMenu(false);
            onDelete(group.id);
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Group',
      `Reset all tasks in "${group.name}"? This will uncheck all completed tasks.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => setShowMenu(false)
        },
        {
          text: 'Reset',
          onPress: () => {
            setShowMenu(false);
            onReset(group.id);
          },
        },
      ]
    );
  };

  const handleSettings = () => {
    setShowMenu(false);
    setShowSettings(true);
  };

  // Close menu when tapping outside
  const handleCardPress = () => {
    if (showMenu) {
      setShowMenu(false);
    } else {
      handlePress();
    }
  };

  const styles = getStyles(isDark);

  return (
    <>
      <MotiView
        from={{ opacity: 0, scale: 0.9, translateY: 20 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 150 }}
        style={{ position: 'relative' }}
      >
        <TouchableOpacity
          onPress={handleCardPress}
          style={[
            styles.card,
            todayStreakComplete ? styles.cardComplete : styles.cardDefault
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{group.name}</Text>
            <TouchableOpacity
              onPress={handleMenuToggle}
              style={styles.menuButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreVertical size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                Today: {todayCompletedTasks} of {group.streakThreshold} for streak
              </Text>
              {group.streak > 0 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakText}>🔥 {group.streak} day streak</Text>
                </View>
              )}
            </View>
            <ProgressBar progress={Math.min(streakProgress, 1)} />
            
            {totalTasks > 0 && (
              <Text style={styles.totalTasksText}>
                Total tasks: {group.tasks.filter(t => t.completed).length}/{totalTasks}
              </Text>
            )}
          </View>

          {totalTasks === 0 && (
            <Text style={styles.emptyText}>
              No tasks yet. Tap to add some!
            </Text>
          )}
        </TouchableOpacity>

        {showMenu && (
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: -10 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, translateY: -10 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={styles.menu}
          >
            <TouchableOpacity
              onPress={handleSettings}
              style={[styles.menuItem, styles.menuItemBorder]}
            >
              <Settings size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReset}
              style={[styles.menuItem, styles.menuItemBorder]}
            >
              <RotateCcw size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text style={styles.menuItemText}>Reset Tasks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.menuItem}
            >
              <Trash2 size={16} color="#ef4444" />
              <Text style={styles.menuItemTextDanger}>Delete Group</Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </MotiView>

      <GroupSettingsModal
        visible={showSettings}
        group={group}
        onClose={() => setShowSettings(false)}
        onUpdateStreakThreshold={onUpdateStreakThreshold}
      />

      <ConfettiAnimation
        trigger={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
      <TadaAnimation show={showCelebration} />
    </>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: isDark ? '#1f2937' : 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
  },
  cardDefault: {
    borderColor: isDark ? '#374151' : '#e5e7eb',
  },
  cardComplete: {
    borderColor: '#a7f3d0',
    backgroundColor: isDark ? '#064e3b' : '#f0fdf4',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#f9fafb' : '#111827',
    flex: 1,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
    flex: 1,
  },
  streakBadge: {
    backgroundColor: isDark ? '#451a03' : '#fef7ee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#b84518',
  },
  totalTasksText: {
    fontSize: 12,
    color: isDark ? '#6b7280' : '#9ca3af',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
    fontStyle: 'italic',
  },
  menu: {
    position: 'absolute',
    right: 16,
    top: 64,
    backgroundColor: isDark ? '#1f2937' : 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.4 : 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#e5e7eb',
    zIndex: 1000,
    minWidth: 160,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#374151' : '#f3f4f6',
  },
  menuItemText: {
    marginLeft: 8,
    color: isDark ? '#d1d5db' : '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  menuItemTextDanger: {
    marginLeft: 8,
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
});