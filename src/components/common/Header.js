import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { spacing, typography, shadows } from '../../theme';

const Header = ({
  title,
  subtitle,
  showBack = true,
  rightAction,
  rightIcon,
  onRightPress,
  transparent = false,
  style,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const paddingTop = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 8;

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: transparent ? 'transparent' : colors.headerBg,
          borderBottomColor: transparent ? 'transparent' : colors.borderLight,
          shadowColor: colors.black,
          paddingTop,
        },
        !transparent && shadows.sm,
        style,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backButton, { backgroundColor: transparent ? 'rgba(0,0,0,0.3)' : colors.inputBg }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.center}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        <View style={styles.right}>
          {rightAction ? (
            <TouchableOpacity onPress={onRightPress} style={[styles.rightButton, { backgroundColor: colors.inputBg }]}>
              <Ionicons name={rightIcon} size={22} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    width: 50,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    width: 50,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.xs,
    marginTop: 2,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
});

export default Header;
