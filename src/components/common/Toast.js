import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ToastMessage from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography } from '../../theme';

const toastConfig = {
  success: ({ text1, text2, props }) => (
    <View style={[styles.toast, { backgroundColor: '#10B981' }]}>
      <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.subtitle}>{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2, props }) => (
    <View style={[styles.toast, { backgroundColor: '#EF4444' }]}>
      <Ionicons name="alert-circle" size={22} color="#FFFFFF" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.subtitle}>{text2}</Text>}
      </View>
    </View>
  ),
  warning: ({ text1, text2, props }) => (
    <View style={[styles.toast, { backgroundColor: '#F59E0B' }]}>
      <Ionicons name="warning" size={22} color="#FFFFFF" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.subtitle}>{text2}</Text>}
      </View>
    </View>
  ),
  info: ({ text1, text2, props }) => (
    <View style={[styles.toast, { backgroundColor: '#3B82F6' }]}>
      <Ionicons name="information-circle" size={22} color="#FFFFFF" />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 && <Text style={styles.subtitle}>{text2}</Text>}
      </View>
    </View>
  ),
};

const Toast = () => {
  return <ToastMessage config={toastConfig} />;
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: typography.md,
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: typography.sm,
    marginTop: 2,
  },
});

export default Toast;
