import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const Loader = ({ size = 'large', color, message, fullScreen = false, transparent = false }) => {
  const { colors } = useTheme();

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, transparent && styles.transparent, { backgroundColor: transparent ? 'rgba(0,0,0,0.3)' : colors.background }]}>
        <View style={[styles.loaderBox, { backgroundColor: colors.card, shadowColor: colors.black }]}>
          <ActivityIndicator size={size} color={color || colors.primary} />
          {message && <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color || colors.primary} />
      {message && <Text style={[styles.message, { color: colors.textSecondary, marginTop: 8 }]}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  transparent: {
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  loaderBox: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 120,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default Loader;
