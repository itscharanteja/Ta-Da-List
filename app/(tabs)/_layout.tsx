import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { Home, BarChart2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/useThemeStore';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopWidth: 0,
            bottom: Platform.OS === 'android' ? (insets.bottom) - 5 : 0,
            left: 0,
            right: 0,
            margin: 0,
            height: Platform.select({
              ios: 88,
              android: 56,
            }),
            paddingBottom: Platform.select({
              ios: insets.bottom,
              android: 0,
            }),
            paddingTop: Platform.OS === 'android' ? 4 : 8,
            elevation: 0,
            shadowOpacity: 0,
            zIndex: 8,
          },
          tabBarBackground: () => (
            <View style={[StyleSheet.absoluteFill, styles.tabBarBackground, { backgroundColor: colors.background }]} />
          ),
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondary,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: Platform.OS === 'android' ? -4 : 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ color, size }) => (
              <Home size={size - 2} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, size }) => (
              <BarChart2 size={size - 2} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarBackground: {
    // backgroundColor will be set dynamically
  },
});