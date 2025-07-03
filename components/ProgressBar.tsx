import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useThemeStore } from '../store/useThemeStore';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
}) => {
  const { isDark } = useThemeStore();
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withSpring(progress, {
      damping: 15,
      stiffness: 150,
    });
  }, [progress]);

  const progressStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progressValue.value,
      [0, 0.5, 1],
      ['#d1d5db', '#3b82f6', '#10b981']
    );

    return {
      width: `${progressValue.value * 100}%`,
      backgroundColor,
    };
  });

  const styles = getStyles(isDark);

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View
        style={[styles.progress, progressStyle]}
      />
    </View>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#374151' : '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
});