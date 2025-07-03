import React from 'react';
import { View, Text } from 'react-native';
import { MotiView } from 'moti';
import { Flame } from 'lucide-react-native';

interface TadaAnimationProps {
  show: boolean;
}

export const TadaAnimation: React.FC<TadaAnimationProps> = ({ show }) => {
  if (!show) return null;

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 300,
        }}
        style={{ alignItems: 'center' }}
      >
        <View style={{
          backgroundColor: '#f59e0b',
          borderRadius: 50,
          padding: 16,
          marginBottom: 16,
        }}>
          <Flame size={48} color="white" />
        </View>
        <MotiView
          from={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.2, 1] }}
          transition={{
            type: 'timing',
            duration: 600,
            loop: true,
          }}
        >
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: '#f59e0b',
          }}>
            Streak Goal!
          </Text>
        </MotiView>
      </MotiView>
    </View>
  );
};