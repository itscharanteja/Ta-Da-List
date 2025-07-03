import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useThemeStore } from '../store/useThemeStore';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const { isDark } = useThemeStore();
  const [title, setTitle] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleAdd = () => {
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
      onClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    onClose();
  };

  const styles = getStyles(isDark, insets, keyboardHeight, windowHeight);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        style={styles.overlay}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -20}
          pointerEvents="box-none"
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
            <MotiView
              from={{ opacity: 0, scale: 0.8, translateY: 50 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, translateY: 50 }}
              transition={{ type: 'spring', damping: 15, stiffness: 150 }}
              style={styles.modal}
            >
              <View style={styles.header}>
                <Text style={styles.title}>New Task</Text>
                <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <X size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
              </View>

              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter task title..."
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                style={styles.input}
                autoFocus
                onSubmitEditing={handleAdd}
                returnKeyType="done"
              />

              <TouchableOpacity
                onPress={handleAdd}
                style={[
                  styles.button,
                  title.trim() ? styles.buttonEnabled : styles.buttonDisabled
                ]}
                disabled={!title.trim()}
              >
                <Text style={styles.buttonText}>Add Task</Text>
              </TouchableOpacity>
            </MotiView>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
};

const getStyles = (isDark: boolean, insets: any, keyboardHeight: number, windowHeight: number) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    ...Platform.select({
      android: {
        paddingTop: 0,
      },
      ios: {
        justifyContent: 'flex-end',
      },
    }),
  },
  keyboardView: {
    width: '100%',
    ...Platform.select({
      ios: {
        justifyContent: 'flex-end',
      },
      android: {
        justifyContent: 'center',
      },
    }),
  },
  modalContainer: {
    width: '100%',
    padding: 16,
  },
  modal: {
    backgroundColor: isDark ? '#000000' : 'white',
    borderRadius: 20,
    padding: 24,
    paddingBottom: Math.max(insets.bottom + 16, 24),
    width: '100%',
    maxHeight: Platform.select({
      ios: keyboardHeight > 0 
        ? windowHeight - keyboardHeight + insets.bottom 
        : windowHeight * 0.9,
      android: windowHeight * 0.8,
    }),
    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#f9fafb' : '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: isDark ? '#4b5563' : '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: isDark ? '#1f1f1f' : '#f9fafb',
    color: isDark ? '#f9fafb' : '#111827',
  },
  button: {
    borderRadius: 8,
    padding: 16,
  },
  buttonEnabled: {
    backgroundColor: '#3b82f6',
  },
  buttonDisabled: {
    backgroundColor: isDark ? '#4b5563' : '#d1d5db',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});