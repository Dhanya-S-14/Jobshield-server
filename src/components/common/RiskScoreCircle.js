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
        <Text style={[styles.score, { color: riskColor, fontSize: size * 0.22 }]}>
          {score !== null && score !== undefined ? score : '?'}
        </Text>
        <Text style={[styles.percent, { color: colors.textMuted, fontSize: size * 0.1 }]}>%</Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: riskColor, fontSize: size * 0.1 }]}>{label}</Text>
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
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontWeight: '800',
  },
  percent: {
    fontWeight: '600',
    marginLeft: 1,
  },
  label: {
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default RiskScoreCircle;
