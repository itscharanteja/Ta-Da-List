import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { View, Platform, StyleSheet, StatusBar } from 'react-native';
import { useUserStore } from '@/store/useUserStore';
import { SplashScreen } from 'expo-router';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const { initializeStore } = useUserStore();

  useEffect(() => {
    initializeStore().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  // Ensure status bar background is black on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#000000');
      StatusBar.setTranslucent(true);
    }
  }, []);

  return (
    <SafeAreaProvider style={styles.provider}>
      <View style={[
        styles.statusBarBackground,
        { height: StatusBar.currentHeight || 0 }
      ]} />
      <ExpoStatusBar 
        style="light"
        translucent={true}
      />
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaView 
          style={[
            styles.safeArea,
            Platform.OS === 'android' && styles.androidSafeArea
          ]}
          edges={Platform.OS === 'ios' ? ['top'] : []}
        >
          <View style={styles.content}>
            <Stack 
              screenOptions={{ 
                headerShown: false,
                contentStyle: styles.stackContent,
                animation: 'fade',
              }}
            >
              <Stack.Screen 
                name="welcome"
                options={{
                  contentStyle: styles.stackContent,
                }}
              />
              <Stack.Screen 
                name="(tabs)" 
                options={{
                  contentStyle: styles.stackContent,
                }}
              />
              <Stack.Screen 
                name="group/[id]"
                options={{
                  contentStyle: styles.stackContent,
                }}
              />
              <Stack.Screen 
                name="+not-found"
                options={{
                  contentStyle: styles.stackContent,
                }}
              />
            </Stack>
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  provider: {
    flex: 1,
    backgroundColor: '#000000',
  },
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  androidSafeArea: {
    paddingTop: 0,
  },
  content: {
    flex: 1,
    backgroundColor: '#000000',
  },
  stackContent: {
    backgroundColor: '#000000',
  },
});