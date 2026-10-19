import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { getRiskColor, getRiskLevel, getRiskLabel } from '../../utils/helpers';
import { typography } from '../../theme';

const RiskScoreCircle = ({ score, size = 120, strokeWidth = 10, showLabel = true, style }) => {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const level = getRiskLevel(score);
  const riskColor = getRiskColor(level, colors);
  const label = getRiskLabel(level);
  const progress = Math.min(Math.max(score || 0, 0), 100) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={[styles.container, style]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={riskColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.content}>
        <View style={styles.scoreRow}>
          <Text style={[styles.score, { color: riskColor, fontSize: size * 0.24 }]}>
            {score !== null && score !== undefined ? score : '?'}
          </Text>
          <Text style={[styles.percent, { color: riskColor, fontSize: size * 0.11 }]}>%</Text>
        </View>
        <Text style={[styles.metricLabel, { color: colors.textMuted, fontSize: size * 0.08 }]}>RISK</Text>
      </View>
      {showLabel && (
        <View style={styles.labelWrapper}>
          <Text style={[styles.label, { color: riskColor, fontSize: size * 0.1 }]}>{label}</Text>
          <Text style={[styles.safetyText, { color: colors.textSecondary, fontSize: size * 0.085 }]}>
            {score <= 25 ? `🛡️ ${100 - score}% Safe` : score <= 50 ? `⚠️ ${100 - score}% Trust` : `🚫 ${score}% Scam Risk`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  percent: {
    fontWeight: '700',
    marginLeft: 1,
  },
  metricLabel: {
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: -2,
  },
  labelWrapper: {
    alignItems: 'center',
    marginTop: 6,
  },
  label: {
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  safetyText: {
    fontWeight: '600',
    marginTop: 2,
  },
});

export default RiskScoreCircle;
