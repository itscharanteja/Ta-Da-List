import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useThemeStore } from '../store/useThemeStore';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
}) => {
  const { isDark } = useThemeStore();
  const styles = getStyles(isDark);

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: 20 }}
      transition={{ type: 'timing', duration: 200 }}
    >
      <View style={styles.container}>
        <MotiView
          animate={{
            scale: task.completed ? [1, 1.2, 1] : 1,
          }}
          transition={{
            type: 'spring',
            damping: 15,
            stiffness: 300,
          }}
        >
          <TouchableOpacity
            onPress={onToggle}
            style={[
              styles.checkbox,
              task.completed ? styles.checkboxCompleted : styles.checkboxDefault
            ]}
          >
            {task.completed && (
              <MotiView
                from={{ scale: 0, rotate: '0deg' }}
                animate={{ scale: 1, rotate: '360deg' }}
                transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              >
                <Check size={14} color="white" />
              </MotiView>
            )}
          </TouchableOpacity>
        </MotiView>

        <Text
          style={[
            styles.title,
            task.completed ? styles.titleCompleted : styles.titleDefault
          ]}
        >
          {task.title}
        </Text>

        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}
        >
          <X size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </MotiView>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1f2937' : 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#f3f4f6',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDefault: {
    borderColor: isDark ? '#6b7280' : '#d1d5db',
  },
  checkboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  title: {
    flex: 1,
  },
  titleDefault: {
    color: isDark ? '#f9fafb' : '#111827',
  },
  titleCompleted: {
    color: isDark ? '#9ca3af' : '#6b7280',
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
});