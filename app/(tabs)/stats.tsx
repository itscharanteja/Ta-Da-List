import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { useThemeStore } from '../../store/useThemeStore';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Trophy, Target, CircleCheck as CheckCircle, Calendar, Flame } from 'lucide-react-native';
import { MotiView } from 'moti';

export default function StatsScreen() {
  const { groups } = useAppStore();
  const { isDark } = useThemeStore();
  const insets = useSafeAreaInsets();

  const totalGroups = groups.length;
  const totalTasks = groups.reduce((sum, group) => sum + group.tasks.length, 0);
  const completedTasks = groups.reduce(
    (sum, group) => sum + group.tasks.filter(task => task.completed).length,
    0
  );
  const totalStreaks = groups.reduce((sum, group) => sum + group.streak, 0);
  const activeStreaks = groups.filter(group => group.streak > 0).length;
  const longestStreak = Math.max(0, ...groups.map(group => group.streak));

  // Today's progress
  const today = new Date().toISOString().split('T')[0];
  const todayStats = groups.map(group => {
    const todayCompleted = group.tasks.filter(task => {
      if (!task.completed || !task.completedAt) return false;
      const taskDate = task.completedAt.toISOString().split('T')[0];
      return taskDate === today;
    }).length;
    
    return {
      name: group.name,
      completed: todayCompleted,
      threshold: group.streakThreshold,
      streak: group.streak,
      goalMet: todayCompleted >= group.streakThreshold,
    };
  });

  const todayGoalsMet = todayStats.filter(stat => stat.goalMet).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const StatCard = ({ icon: Icon, title, value, subtitle, color = '#3b82f6', index }: any) => (
    <MotiView
      from={{ opacity: 0, scale: 0.8, translateY: 30 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ 
        type: 'spring', 
        damping: 15, 
        stiffness: 150,
        delay: index * 100 
      }}
      style={getStatCardStyles(isDark).statCard}
    >
      <View style={getStatCardStyles(isDark).statHeader}>
        <View style={[getStatCardStyles(isDark).iconContainer, { backgroundColor: `${color}20` }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={getStatCardStyles(isDark).statTitle}>{title}</Text>
      </View>
      <Text style={getStatCardStyles(isDark).statValue}>{value}</Text>
      {subtitle && (
        <Text style={getStatCardStyles(isDark).statSubtitle}>{subtitle}</Text>
      )}
    </MotiView>
  );

  const styles = getStyles(isDark, insets);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Statistics</Text>
              <Text style={styles.subtitle}>Your daily habit tracking overview</Text>
            </View>
            <ThemeToggle />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {totalGroups === 0 ? (
            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
              style={styles.emptyState}
            >
              <Text style={styles.emptyTitle}>No data yet</Text>
              <Text style={styles.emptySubtitle}>
                Create some groups and tasks to see your statistics
              </Text>
            </MotiView>
          ) : (
            <>
              {/* Today's Progress */}
              <StatCard
                icon={Target}
                title="Today's Goals"
                value={`${todayGoalsMet}/${totalGroups}`}
                subtitle={`${totalGroups > 0 ? Math.round((todayGoalsMet / totalGroups) * 100) : 0}% of daily goals met`}
                color="#10b981"
                index={0}
              />

              {/* Streak Stats */}
              <StatCard
                icon={Flame}
                title="Longest Streak"
                value={longestStreak}
                subtitle={`${activeStreaks} active streak${activeStreaks !== 1 ? 's' : ''}`}
                color="#f59e0b"
                index={1}
              />

              <StatCard
                icon={Trophy}
                title="Total Streak Days"
                value={totalStreaks}
                subtitle="Accumulated across all groups"
                color="#8b5cf6"
                index={2}
              />

              {/* Task Completion */}
              <StatCard
                icon={CheckCircle}
                title="Task Completion"
                value={`${completedTasks}/${totalTasks}`}
                subtitle={`${completionRate.toFixed(1)}% overall completion rate`}
                index={3}
              />

              <StatCard
                icon={Calendar}
                title="Active Groups"
                value={totalGroups}
                subtitle="Currently managing"
                index={4}
              />

              {/* Today's Detailed Progress */}
              {todayStats.length > 0 && (
                <MotiView
                  from={{ opacity: 0, translateY: 30 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ 
                    type: 'spring', 
                    damping: 15, 
                    stiffness: 150,
                    delay: 500 
                  }}
                  style={styles.todaySection}
                >
                  <Text style={styles.sectionTitle}>Today's Progress</Text>
                  {todayStats.map((stat, index) => (
                    <MotiView
                      key={index}
                      from={{ opacity: 0, translateX: -30 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ 
                        type: 'spring', 
                        damping: 15, 
                        stiffness: 150,
                        delay: 600 + (index * 100) 
                      }}
                      style={styles.todayItem}
                    >
                      <View style={styles.todayItemHeader}>
                        <Text style={styles.todayItemName}>{stat.name}</Text>
                        <View style={[
                          styles.goalBadge,
                          stat.goalMet ? styles.goalBadgeSuccess : styles.goalBadgeDefault
                        ]}>
                          <Text style={[
                            styles.goalBadgeText,
                            stat.goalMet ? styles.goalBadgeTextSuccess : styles.goalBadgeTextDefault
                          ]}>
                            {stat.completed}/{stat.threshold}
                          </Text>
                        </View>
                      </View>
                      {stat.streak > 0 && (
                        <Text style={styles.todayItemStreak}>
                          🔥 {stat.streak} day streak
                        </Text>
                      )}
                    </MotiView>
                  ))}
                </MotiView>
              )}

              {/* Top Performing Groups */}
              {groups.length > 0 && (
                <MotiView
                  from={{ opacity: 0, translateY: 30 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ 
                    type: 'spring', 
                    damping: 15, 
                    stiffness: 150,
                    delay: 700 
                  }}
                  style={styles.topGroupsSection}
                >
                  <Text style={styles.sectionTitle}>Streak Leaders</Text>
                  {groups
                    .filter(group => group.streak > 0)
                    .sort((a, b) => b.streak - a.streak)
                    .slice(0, 5)
                    .map((group, index) => (
                      <MotiView
                        key={group.id}
                        from={{ opacity: 0, translateX: -30 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{ 
                          type: 'spring', 
                          damping: 15, 
                          stiffness: 150,
                          delay: 800 + (index * 100) 
                        }}
                        style={styles.topGroupItem}
                      >
                        <Text style={styles.topGroupName}>{group.name}</Text>
                        <View style={styles.streakBadge}>
                          <Text style={styles.streakText}>🔥 {group.streak} days</Text>
                        </View>
                      </MotiView>
                    ))}
                  {groups.filter(group => group.streak > 0).length === 0 && (
                    <Text style={styles.noStreaksText}>
                      Complete daily goals to build streaks!
                    </Text>
                  )}
                </MotiView>
              )}
            </>
          )}
        </ScrollView>
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDark ? '#f9fafb' : '#111827',
  },
  subtitle: {
    color: isDark ? '#9ca3af' : '#6b7280',
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
  },
  todaySection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#f9fafb' : '#111827',
    marginBottom: 12,
  },
  todayItem: {
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
  todayItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todayItemName: {
    fontWeight: '500',
    color: isDark ? '#f9fafb' : '#111827',
    flex: 1,
  },
  goalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalBadgeDefault: {
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
  },
  goalBadgeSuccess: {
    backgroundColor: isDark ? '#064e3b' : '#dcfce7',
  },
  goalBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  goalBadgeTextDefault: {
    color: isDark ? '#9ca3af' : '#6b7280',
  },
  goalBadgeTextSuccess: {
    color: '#166534',
  },
  todayItemStreak: {
    fontSize: 12,
    color: '#b84518',
    marginTop: 4,
  },
  topGroupsSection: {
    marginTop: 16,
  },
  topGroupItem: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topGroupName: {
    fontWeight: '500',
    color: isDark ? '#f9fafb' : '#111827',
    flex: 1,
  },
  streakBadge: {
    backgroundColor: isDark ? '#451a03' : '#fef7ee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#b84518',
  },
  noStreaksText: {
    color: isDark ? '#9ca3af' : '#6b7280',
    fontStyle: 'italic',
  },
});

const getStatCardStyles = (isDark: boolean) => StyleSheet.create({
  statCard: {
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
    borderColor: isDark ? '#374151' : '#e5e7eb',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  statTitle: {
    color: isDark ? '#9ca3af' : '#6b7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDark ? '#f9fafb' : '#111827',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: isDark ? '#9ca3af' : '#6b7280',
  },
});