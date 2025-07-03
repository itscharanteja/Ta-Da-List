import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Dimensions,
  BackHandler,
  StatusBar,
  Keyboard,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { MotiView, AnimatePresence } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AddGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, streakThreshold: number) => void;
}

export const AddGroupModal: React.FC<AddGroupModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const { isDark } = useThemeStore();
  const [name, setName] = useState('');
  const [streakThreshold, setStreakThreshold] = useState('1');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;

  // Handle keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });
    
    const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  // Handle Android back button
  useEffect(() => {
    if (visible && Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        handleClose();
        return true;
      });
      return () => backHandler.remove();
    }
  }, [visible]);

  const handleAdd = () => {
    if (name.trim()) {
      const threshold = parseInt(streakThreshold) || 1;
      onAdd(name.trim(), threshold);
      setName('');
      setStreakThreshold('1');
      onClose();
    }
  };

  const handleClose = () => {
    // Dismiss keyboard first
    Keyboard.dismiss();
    setName('');
    setStreakThreshold('1');
    onClose();
  };

  const styles = getStyles(isDark, insets, windowHeight, windowWidth, keyboardHeight, isKeyboardVisible);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.modalWrapper}>
      <StatusBar
        backgroundColor="rgba(0, 0, 0, 0.5)"
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent={true}
      />
      
      <AnimatePresence>
        {visible && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: 200 }}
            style={styles.overlay}
          >
            {/* Background touchable */}
            <TouchableOpacity 
              style={styles.backgroundTouchable}
              onPress={handleClose}
              activeOpacity={1}
            />
            
            {/* Modal content */}
            <View style={styles.contentContainer}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
              >
                <MotiView
                  from={{ opacity: 0, scale: 0.9, translateY: 100 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    translateY: isKeyboardVisible && Platform.OS === 'android' ? -keyboardHeight / 4 : 0
                  }}
                  exit={{ opacity: 0, scale: 0.9, translateY: 100 }}
                  transition={{ 
                    type: 'spring',
                    damping: 20,
                    stiffness: 300,
                  }}
                  style={styles.modalContainer}
                >
                  <View style={styles.modal}>
                    <View style={styles.handle} />
                    
                    <View style={styles.header}>
                      <Text style={styles.title}>New Group</Text>
                      <TouchableOpacity 
                        onPress={handleClose} 
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        style={styles.closeButton}
                        activeOpacity={0.7}
                      >
                        <X size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView 
                      bounces={false} 
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                      contentContainerStyle={styles.scrollContent}
                      keyboardDismissMode="interactive"
                    >
                      <View style={styles.content}>
                        <View style={styles.inputSection}>
                          <Text style={styles.label}>Group Name</Text>
                          <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter group name..."
                            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                            style={styles.input}
                            autoFocus={false}
                            underlineColorAndroid="transparent"
                            returnKeyType="next"
                            onSubmitEditing={() => {
                              // Focus next input if available
                            }}
                          />
                        </View>

                        <View style={styles.inputSection}>
                          <Text style={styles.label}>Daily Streak Goal</Text>
                          <Text style={styles.description}>
                            How many tasks need to be completed daily to maintain your streak?
                          </Text>
                          <TextInput
                            value={streakThreshold}
                            onChangeText={setStreakThreshold}
                            placeholder="1"
                            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                            keyboardType="numeric"
                            style={styles.input}
                            onSubmitEditing={handleAdd}
                            returnKeyType="done"
                            underlineColorAndroid="transparent"
                          />
                        </View>

                        <TouchableOpacity
                          onPress={handleAdd}
                          style={[
                            styles.button,
                            name.trim() ? styles.buttonEnabled : styles.buttonDisabled
                          ]}
                          disabled={!name.trim()}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.buttonText}>Create Group</Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </View>
                </MotiView>
              </KeyboardAvoidingView>
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
};

const getStyles = (
  isDark: boolean, 
  insets: any, 
  windowHeight: number, 
  windowWidth: number, 
  keyboardHeight: number, 
  isKeyboardVisible: boolean
) => StyleSheet.create({
  modalWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backgroundTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: isKeyboardVisible ? 'flex-start' : 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: isKeyboardVisible ? Math.max(insets.top + 20, 60) : insets.top,
    paddingBottom: isKeyboardVisible ? 20 : insets.bottom,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 400,
    justifyContent: 'center',
  },
  modalContainer: {
    width: '100%',
  },
  modal: {
    backgroundColor: isDark ? '#000000' : 'white',
    borderRadius: 20,
    maxHeight: isKeyboardVisible 
      ? windowHeight - keyboardHeight - (insets.top + 40) - 40
      : windowHeight * 0.8,
    width: '100%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: isDark ? '#4b5563' : '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: isDark ? '#374151' : '#e5e7eb',
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: isKeyboardVisible ? 20 : 0,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#f9fafb' : '#111827',
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#d1d5db' : '#374151',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: isDark ? '#9ca3af' : '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  input: {
    borderWidth: 2,
    borderColor: isDark ? '#4b5563' : '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: isDark ? '#111827' : '#ffffff',
    color: isDark ? '#f9fafb' : '#111827',
    fontWeight: '500',
    ...Platform.select({
      android: {
        paddingVertical: 16,
        paddingHorizontal: 16,
        textAlignVertical: 'center',
      },
    }),
  },
  button: {
    borderRadius: 12,
    padding: 18,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonEnabled: {
    backgroundColor: '#3b82f6',
  },
  buttonDisabled: {
    backgroundColor: isDark ? '#374151' : '#d1d5db',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});