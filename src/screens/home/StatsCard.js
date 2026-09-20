import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';

const StatsCard = ({ icon, count, label, bgColor, onPress }) => {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: count || 0,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [count]);

  const animatedCount = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
  });

  const displayCount = animatedValue.__getValue ? Math.round(animatedValue.__getValue()) : (count || 0);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.black }, shadows.md]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: bgColor + '20' }]}>
        <Ionicons name={icon} size={22} color={bgColor} />
      </View>
      <Text style={[styles.count, { color: colors.text }]}>
        {displayCount}
      </Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  count: {
    fontSize: typography.xxl,
    fontWeight: '800',
  },
  label: {
    fontSize: typography.xs,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default StatsCard;
