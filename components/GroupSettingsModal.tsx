import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import { X, Target } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Group } from '../types';

interface GroupSettingsModalProps {
  visible: boolean;
  group: Group;
  onClose: () => void;
  onUpdateStreakThreshold: (groupId: string, threshold: number) => void;
}

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  visible,
  group,
  onClose,
  onUpdateStreakThreshold,
}) => {
  const { isDark } = useThemeStore();
  const [streakThreshold, setStreakThreshold] = useState(group.streakThreshold.toString());
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSave = () => {
    const threshold = parseInt(streakThreshold) || 1;
    onUpdateStreakThreshold(group.id, threshold);
    onClose();
  };

  const handleClose = () => {
    setStreakThreshold(group.streakThreshold.toString());
    onClose();
  };

  const styles = getStyles(isDark, insets, keyboardHeight, windowHeight);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: 50 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, translateY: 50 }}
            transition={{ type: 'spring', damping: 15, stiffness: 150 }}
            style={styles.modal}
          >
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Group Settings</Text>
                <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
            </View>

            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupStats}>
                {group.tasks.length} tasks • {group.streak} day streak
              </Text>
            </View>

            <View style={styles.settingSection}>
              <View style={styles.settingHeader}>
                <Target size={20} color="#3b82f6" />
                <Text style={styles.settingTitle}>Daily Streak Goal</Text>
              </View>
              <Text style={styles.settingDescription}>
                How many tasks need to be completed each day to maintain your streak?
              </Text>
              <TextInput
                value={streakThreshold}
                onChangeText={setStreakThreshold}
                placeholder="1"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                keyboardType="numeric"
                style={styles.input}
                onSubmitEditing={handleSave}
                  returnKeyType="done"
              />
              <Text style={styles.helperText}>
                Current setting: Complete {group.streakThreshold} task{group.streakThreshold !== 1 ? 's' : ''} daily
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleClose}
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.button, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
            </ScrollView>
          </MotiView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const getStyles = (isDark: boolean, insets: any, keyboardHeight: number, windowHeight: number) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: isDark ? '#000000' : 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Math.max(insets.bottom + 16, 24),
    maxHeight: keyboardHeight > 0 
      ? windowHeight - keyboardHeight + insets.bottom 
      : windowHeight * 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#f9fafb' : '#111827',
  },
  groupInfo: {
    backgroundColor: isDark ? '#1f1f1f' : '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#f9fafb' : '#111827',
    marginBottom: 4,
  },
  groupStats: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
  },
  settingSection: {
    marginBottom: 24,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? '#d1d5db' : '#374151',
    marginLeft: 8,
  },
  settingDescription: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: isDark ? '#4b5563' : '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: isDark ? '#1f1f1f' : '#f9fafb',
    color: isDark ? '#f9fafb' : '#111827',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: isDark ? '#6b7280' : '#9ca3af',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
  },
  cancelButton: {
    backgroundColor: isDark ? '#1f1f1f' : '#f3f4f6',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  cancelButtonText: {
    color: isDark ? '#d1d5db' : '#374151',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});