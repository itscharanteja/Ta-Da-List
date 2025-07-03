import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUserStore } from '@/store/useUserStore';
import { useThemeStore } from '@/store/useThemeStore';

export default function Welcome() {
  const { colors } = useThemeStore();
  const { setName, setOnboardingComplete } = useUserStore();
  const [nameInput, setNameInput] = useState('');
  const [showSwipeGuide, setShowSwipeGuide] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Continuous swipe guide animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(swipeAnim, {
          toValue: -50,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(swipeAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      // Cleanup animations
      fadeAnim.stopAnimation();
      swipeAnim.stopAnimation();
      logoAnim.stopAnimation();
      slideAnim.stopAnimation();
    };
  }, []);

  // Handle name submission
  const handleNameSubmit = async () => {
    if (nameInput.trim().length === 0) {
      return;
    }

    try {
      await setName(nameInput.trim());
      Keyboard.dismiss();
      
      // Animate logo
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSwipeGuide(true);
      });
    } catch (error) {
      console.error('Error saving name:', error);
      Alert.alert('Error', 'Failed to save name. Please try again.');
    }
  };

  const handleComplete = async () => {
    if (isTransitioning) return;
    
    try {
      setIsTransitioning(true);
      
      // Complete onboarding first
      await setOnboardingComplete();

      // Then start the animation
      Animated.timing(slideAnim, {
        toValue: -Dimensions.get('window').height,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Navigate after animation completes
        router.replace('/(tabs)');
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsTransitioning(false);
      Alert.alert('Error', 'Failed to complete setup. Please try again.');
    }
  };

  const ContinueButton = () => (
    <TouchableOpacity 
      onPress={handleComplete}
      style={[styles.continueButton, { backgroundColor: colors.primary }]}
      activeOpacity={0.8}
      disabled={isTransitioning}
    >
      <Text style={styles.continueButtonText}>Continue to App</Text>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <Pressable 
      style={[styles.container, { backgroundColor: colors.background }]}
      onPress={() => Keyboard.dismiss()}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <StatusBar style="light" />
        
        <Animated.View 
          style={[
            styles.content,
            { 
              opacity: fadeAnim,
              transform: [
                { scale: logoAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Welcome to</Text>
          <Text style={[styles.logo, { color: colors.primary }]}>
            T<Text style={{ color: colors.error }}>a</Text>-D<Text style={{ color: colors.error }}>a</Text>
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondary }]}>
            Turn your tasks into moments of triumph!
          </Text>

          {!showSwipeGuide ? (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                What should we call you?
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.secondary}
                  value={nameInput}
                  onChangeText={setNameInput}
                  onSubmitEditing={handleNameSubmit}
                  returnKeyType="done"
                  autoFocus
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                    !nameInput.trim() && { opacity: 0.5 }
                  ]}
                  onPress={handleNameSubmit}
                  disabled={!nameInput.trim()}
                >
                  <Text style={styles.submitButtonText}>→</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <ContinueButton />
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10,
  },
  submitButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 24,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    marginRight: 8,
  },
  arrow: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 