import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { MotiView } from 'moti';

const { width: screenWidth } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  color: string;
  x: number;
  delay: number;
}

interface ConfettiAnimationProps {
  trigger: boolean;
  onComplete?: () => void;
}

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  trigger,
  onComplete,
}) => {
  const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];
  
  const confettiPieces: ConfettiPiece[] = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: Math.random() * screenWidth,
    delay: Math.random() * 500,
  }));

  useEffect(() => {
    if (trigger && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!trigger) return null;

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
    }}>
      {confettiPieces.map((piece) => (
        <MotiView
          key={piece.id}
          from={{
            translateY: -100,
            translateX: piece.x,
            opacity: 1,
            rotate: '0deg',
            scale: 1,
          }}
          animate={{
            translateY: 800,
            translateX: piece.x + (Math.random() - 0.5) * 200,
            opacity: 0,
            rotate: `${Math.random() * 720}deg`,
            scale: 0.5,
          }}
          transition={{
            type: 'timing',
            duration: 2000,
            delay: piece.delay,
          }}
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            backgroundColor: piece.color,
          }}
        />
      ))}
    </View>
  );
};