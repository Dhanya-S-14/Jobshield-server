import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, shadows } from '../../theme';

const Card = ({
  children,
  style,
  noPadding = false,
  glass = false,
  bordered = false,
  onPress,
}) => {
  const { colors } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: glass ? 'rgba(255,255,255,0.1)' : colors.card,
      borderColor: bordered ? colors.border : 'transparent',
      borderWidth: bordered ? 1 : 0,
      shadowColor: colors.black,
    },
    !glass && shadows.md,
    glass && styles.glass,
    !noPadding && styles.padding,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  padding: {
    padding: spacing.md,
  },
  glass: {
    backdropFilter: 'blur(10px)',
  },
});

export default Card;
