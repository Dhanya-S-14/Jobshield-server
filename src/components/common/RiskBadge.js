import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, typography } from '../../theme';
import { getRiskColor, getRiskLabel } from '../../utils/helpers';

const RiskBadge = ({ level, score, size = 'md', showIcon = true, style }) => {
  const { colors } = useTheme();
  const normalized = (level || '').toLowerCase();
  const riskColor = getRiskColor(normalized, colors);
  const label = getRiskLabel(normalized);

  const iconName = normalized === 'safe' || normalized === 'low' ? 'shield-checkmark' :
                   normalized === 'suspicious' || normalized === 'medium' ? 'warning' : 'flame';

  const getBgColor = () => {
    if (normalized === 'safe' || normalized === 'low') return colors.successLight;
    if (normalized === 'suspicious' || normalized === 'medium') return colors.warningLight;
    if (normalized === 'scam' || normalized === 'high' || normalized === 'critical') return colors.errorLight;
    return colors.border;
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 2, paddingHorizontal: 8 };
      case 'md': return { paddingVertical: 4, paddingHorizontal: 12 };
      case 'lg': return { paddingVertical: 6, paddingHorizontal: 16 };
      default: return { paddingVertical: 4, paddingHorizontal: 12 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return typography.xs;
      case 'md': return typography.sm;
      case 'lg': return typography.md;
      default: return typography.sm;
    }
  };

  const iconSizes = { sm: 12, md: 14, lg: 18 };

  return (
    <View style={[styles.badge, { backgroundColor: getBgColor() }, getPadding(), style]}>
      {showIcon && (
        <Ionicons name={iconName} size={iconSizes[size] || 14} color={riskColor} style={styles.icon} />
      )}
      <Text style={[styles.label, { color: riskColor, fontSize: getFontSize(), fontWeight: size === 'lg' ? '700' : '600' }]}>
        {label}
      </Text>
      {score !== undefined && score !== null && size !== 'sm' && (
        <Text style={[styles.score, { color: riskColor, fontSize: getFontSize() }]}>
          {score}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    letterSpacing: 0.3,
  },
  score: {
    marginLeft: 4,
    fontWeight: '700',
  },
});

export default RiskBadge;
