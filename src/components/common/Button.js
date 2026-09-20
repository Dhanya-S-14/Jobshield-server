import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, typography } from '../../theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.grayLight;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'outline': return 'transparent';
      case 'danger': return colors.error;
      case 'ghost': return 'transparent';
      case 'success': return colors.success;
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.gray;
    switch (variant) {
      case 'outline': return colors.primary;
      case 'ghost': return colors.primary;
      default: return colors.white;
    }
  };

  const getBorderColor = () => {
    if (disabled) return colors.grayLight;
    switch (variant) {
      case 'outline': return colors.primary;
      default: return 'transparent';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'md': return { paddingVertical: 14, paddingHorizontal: 24 };
      case 'lg': return { paddingVertical: 18, paddingHorizontal: 32 };
      default: return { paddingVertical: 14, paddingHorizontal: 24 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return typography.sm;
      case 'md': return typography.base;
      case 'lg': return typography.lg;
      default: return typography.base;
    }
  };

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          ...getPadding(),
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={[styles.content, iconPosition === 'right' && styles.reverse]}>
          {icon && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={getTextColor()}
              style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
            />
          )}
          {title && (
            <Text style={[styles.text, { color: getTextColor(), fontSize: getFontSize() }, textStyle]}>
              {title}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reverse: {
    flexDirection: 'row-reverse',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

export default Button;
