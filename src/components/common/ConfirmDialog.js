import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from './Modal';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography } from '../../theme';

const ConfirmDialog = ({ visible, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', destructive = false, loading = false }) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} onClose={onClose} title={title}>
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      )}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
          onPress={onClose}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>{cancelText}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: destructive ? colors.error : colors.primary }]}
          onPress={onConfirm}
          disabled={loading}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
            {loading ? 'Please wait...' : confirmText}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  message: {
    fontSize: typography.md,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cancelButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: typography.base,
    fontWeight: '600',
  },
});

export default ConfirmDialog;
