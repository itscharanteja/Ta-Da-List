import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { useThemeStore } from '../../store/useThemeStore';
import { GroupCard } from '../../components/GroupCard';
import { AddGroupModal } from '../../components/AddGroupModal';
import { ThemeToggle } from '../../components/ThemeToggle';
import { MotiView } from 'moti';

export default function GroupsScreen() {
  const { groups, addGroup, deleteGroup, resetGroup, updateStreakThreshold } = useAppStore();
  const { isDark } = useThemeStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const insets = useSafeAreaInsets();

  const styles = getStyles(isDark, insets);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Ta-Da List</Text>
              <Text style={styles.subtitle}>
                {groups.length} {groups.length === 1 ? 'group' : 'groups'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <ThemeToggle />
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={styles.addButton}
              >
                <Plus size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {groups.length === 0 ? (
            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
              style={styles.emptyState}
            >
              <Text style={styles.emptyTitle}>No groups yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first group to start building daily habits and streaks
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={styles.createButton}
              >
                <Text style={styles.createButtonText}>Create First Group</Text>
              </TouchableOpacity>
            </MotiView>
          ) : (
            groups.map((group, index) => (
              <MotiView
                key={group.id}
                from={{ opacity: 0, translateX: -50 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ 
                  type: 'spring', 
                  damping: 15, 
                  stiffness: 150,
                  delay: index * 100 
                }}
              >
                <GroupCard
                  group={group}
                  onDelete={deleteGroup}
                  onReset={resetGroup}
                  onUpdateStreakThreshold={updateStreakThreshold}
                />
              </MotiView>
            ))
          )}
        </ScrollView>
      </View>

      <AddGroupModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addGroup}
      />
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDark ? '#f9fafb' : '#111827',
  },
  subtitle: {
    color: isDark ? '#9ca3af' : '#6b7280',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    padding: 12,
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
});