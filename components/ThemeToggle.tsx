import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useThemeStore } from '../store/useThemeStore';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <TouchableOpacity onPress={toggleTheme} style={styles.container}>
      <MotiView
        from={{ scale: 0.8, rotate: '0deg' }}
        animate={{ 
          scale: 1, 
          rotate: isDark ? '180deg' : '0deg' 
        }}
        transition={{ 
          type: 'spring', 
          damping: 15, 
          stiffness: 150 
        }}
        style={[
          styles.iconContainer,
          { backgroundColor: isDark ? '#374151' : '#f3f4f6' }
        ]}
      >
        {isDark ? (
          <Moon size={20} color="#fbbf24" />
        ) : (
          <Sun size={20} color="#f59e0b" />
        )}
      </MotiView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
  iconContainer: {
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});