import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { formatDate, getRiskLevel, getRiskColor, getRiskLabel } from '../../utils/helpers';
import RiskScoreCircle from '../../components/common/RiskScoreCircle';
import RiskBadge from '../../components/common/RiskBadge';

const ScanResultCard = ({ scan, onPress, compact = false }) => {
  const { colors } = useTheme();
  const level = getRiskLevel(scan.riskScore);
  const riskColor = getRiskColor(level, colors);

  if (compact) {
    return (
      <TouchableOpacity style={[styles.compactCard, { backgroundColor: colors.card, shadowColor: colors.black, borderLeftColor: riskColor }, shadows.md]} onPress={onPress} activeOpacity={0.7}>
        <RiskScoreCircle score={scan.riskScore} size={56} strokeWidth={6} showLabel={false} />
        <View style={styles.compactInfo}>
          <Text style={[styles.compactCompany, { color: colors.text }]} numberOfLines={1}>{scan.companyName}</Text>
          <Text style={[styles.compactJob, { color: colors.textSecondary }]} numberOfLines={1}>{scan.jobTitle}</Text>
          <RiskBadge level={level} size="sm" showIcon={false} />
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.black, borderLeftColor: riskColor, borderLeftWidth: 4 }, shadows.md]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <RiskScoreCircle score={scan.riskScore} size={64} strokeWidth={7} showLabel={false} />
        <View style={styles.cardInfo}>
          <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={1}>{scan.companyName}</Text>
          <Text style={[styles.jobTitle, { color: colors.textSecondary }]} numberOfLines={1}>{scan.jobTitle}</Text>
          <RiskBadge level={level} size="sm" />
        </View>
      </View>
      <View style={[styles.cardFooter, { borderTopColor: colors.borderLight }]}>
        <View style={styles.footerLeft}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.dateText, { color: colors.textMuted }]}>{formatDate(scan.createdAt)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    width: 220,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  companyName: {
    fontSize: typography.md,
    fontWeight: '700',
  },
  jobTitle: {
    fontSize: typography.sm,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: typography.xs,
    marginLeft: 4,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginRight: spacing.sm,
    width: 240,
    borderLeftWidth: 3,
  },
  compactInfo: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.xs,
  },
  compactCompany: {
    fontSize: typography.md,
    fontWeight: '600',
  },
  compactJob: {
    fontSize: typography.sm,
    marginTop: 1,
  },
});

export default ScanResultCard;
