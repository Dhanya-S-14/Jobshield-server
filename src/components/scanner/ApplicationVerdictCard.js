import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import Card from '../common/Card';

const ApplicationVerdictCard = ({ scan }) => {
  const { colors } = useTheme();

  if (!scan) return null;

  const riskScore = typeof scan.riskScore === 'number' ? scan.riskScore : 50;
  const rawRiskLevel = (scan.riskLevel || '').toLowerCase();
  const rawJobRiskLevel = (scan.jobRiskLevel || '').toLowerCase();

  // Determine application decision: 'ok' | 'caution' | 'not_ok'
  let decision = 'ok';
  if (rawJobRiskLevel === 'fraudulent' || rawRiskLevel === 'scam' || riskScore > 50) {
    decision = 'not_ok';
  } else if (rawJobRiskLevel === 'suspicious' || rawJobRiskLevel === 'needs_verification' || rawRiskLevel === 'suspicious' || riskScore > 25) {
    decision = 'caution';
  } else {
    decision = 'ok';
  }

  // Extract red flags or positive indicators
  const warnings = Array.isArray(scan.warnings) ? scan.warnings : [];
  const explanation = scan.analysis?.explanation || scan.explanation || scan.jobRiskReason || '';
  const keywords = Array.isArray(scan.keywordsFound) ? scan.keywordsFound : [];

  const config = {
    ok: {
      title: 'OK TO APPLY',
      subtitle: 'Verified / Low Risk Job Posting',
      badgeBg: colors.success || '#10B981',
      cardBorder: (colors.success || '#10B981') + '40',
      cardBg: (colors.success || '#10B981') + '0D',
      icon: 'shield-checkmark',
      iconColor: colors.success || '#10B981',
      summary: 'This job posting appears legitimate with no financial scam patterns, fake domains, or fraudulent fees detected.',
      points: [
        'No upfront fees, registration deposits, or payment requests.',
        'Job description and responsibilities match standard industry practices.',
        'Communication and hiring process follow professional recruitment standards.',
      ],
      tip: 'Safety Reminder: Always apply through the company\'s official career page or trusted job boards. Never pay money for any job opportunity.',
    },
    caution: {
      title: 'PROCEED WITH CAUTION',
      subtitle: 'Verification Recommended Before Applying',
      badgeBg: colors.warning || '#F59E0B',
      cardBorder: (colors.warning || '#F59E0B') + '40',
      cardBg: (colors.warning || '#F59E0B') + '0D',
      icon: 'alert-circle',
      iconColor: colors.warning || '#F59E0B',
      summary: 'Some details could not be independently verified. Review the following items before submitting sensitive information.',
      points: [
        scan.jobRiskReason || 'Recruiter may be using a third-party portal or generic email domain.',
        'The company identity could not be fully confirmed in the official registry.',
        'Verify the job opening directly on the employer\'s official website before applying.',
      ],
      tip: 'Do not share your bank account details or government ID copies until you independently confirm the employer\'s identity.',
    },
    not_ok: {
      title: 'NOT OK TO APPLY',
      subtitle: 'High Scam Risk — Do Not Apply',
      badgeBg: colors.error || '#EF4444',
      cardBorder: (colors.error || '#EF4444') + '50',
      cardBg: (colors.error || '#EF4444') + '12',
      icon: 'close-circle',
      iconColor: colors.error || '#EF4444',
      summary: 'JobShield strongly advises AGAINST applying for this job. Multiple critical fraud indicators were detected.',
      points: warnings.length > 0 ? warnings.slice(0, 4) : [
        scan.jobRiskReason || 'Asking for payment, registration fee, security deposit, or training charges.',
        keywords.length > 0 ? `Detected scam keywords: ${keywords.slice(0, 3).map(k => k.keyword || k).join(', ')}` : 'Suspicious contact details, fake company domain, or lookalike website.',
        'Unrealistic salary promises or guaranteed income without proper interview.',
      ],
      tip: 'DO NOT pay any money, do NOT share your OTP or bank details, and do NOT send identity documents (Aadhaar, PAN, Passport).',
    },
  };

  const current = config[decision];

  return (
    <Card style={[styles.card, { borderColor: current.cardBorder, backgroundColor: current.cardBg }]}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: current.badgeBg }]}>
          <Ionicons name={current.icon} size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.badgeText}>{current.title}</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{current.subtitle}</Text>
      </View>

      <Text style={[styles.summary, { color: colors.text }]}>{current.summary}</Text>

      <View style={styles.reasonsContainer}>
        <Text style={[styles.reasonsTitle, { color: colors.text }]}>
          {decision === 'ok' ? 'Why it is OK to apply:' : 'Why you should NOT apply:'}
        </Text>
        {current.points.map((pt, i) => (
          <View key={i} style={styles.pointRow}>
            <Ionicons
              name={decision === 'ok' ? 'checkmark-circle' : decision === 'caution' ? 'warning' : 'close-circle'}
              size={18}
              color={current.iconColor}
              style={styles.pointIcon}
            />
            <Text style={[styles.pointText, { color: colors.textSecondary }]}>{pt}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.tipBox, { backgroundColor: colors.card, borderColor: current.cardBorder }]}>
        <Ionicons name="information-circle" size={18} color={current.iconColor} style={{ marginRight: 8, marginTop: 2 }} />
        <Text style={[styles.tipText, { color: colors.text }]}>{current.tip}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: typography.sm,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: typography.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  summary: {
    fontSize: typography.base,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  reasonsContainer: {
    marginBottom: spacing.md,
  },
  reasonsTitle: {
    fontSize: typography.sm,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  pointIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  pointText: {
    flex: 1,
    fontSize: typography.sm,
    lineHeight: 20,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  tipText: {
    flex: 1,
    fontSize: typography.xs,
    lineHeight: 18,
    fontWeight: '500',
  },
});

export default ApplicationVerdictCard;
