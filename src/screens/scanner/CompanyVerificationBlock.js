import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography } from '../../theme';
import Card from '../../components/common/Card';

const statusMeta = {
  Verified: { color: 'success', icon: 'checkmark-circle' },
  'Needs verification': { color: 'warning', icon: 'alert-circle' },
  Suspicious: { color: 'error', icon: 'close-circle' },
  Unknown: { color: 'textMuted', icon: 'help-circle' },
};

const levelMeta = {
  'enterprise-verified': { label: 'Enterprise Verified', color: 'success' },
  'domain-verified': { label: 'Domain Verified', color: 'success' },
  'identity-verified': { label: 'Identity Verified', color: 'warning' },
  suspicious: { label: 'Suspicious', color: 'error' },
  unknown: { label: 'Unknown', color: 'textMuted' },
};

const rowColor = (colors, key) => (key === 'success' ? colors.success : key === 'warning' ? colors.warning : key === 'error' ? colors.error : colors.textMuted);

const Row = ({ colors, label, status, detail }) => {
  const meta = statusMeta[status] || statusMeta.Unknown;
  const color = rowColor(colors, meta.color);
  return (
    <View style={[styles.row, { borderBottomColor: colors.borderLight }]}>
      <Ionicons name={meta.icon} size={18} color={color} style={styles.rowIcon} />
      <View style={styles.rowBody}>
        <View style={styles.rowHeader}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.rowStatus, { color }]}>{status}</Text>
        </View>
        {detail ? <Text style={[styles.rowDetail, { color: colors.textSecondary }]}>{detail}</Text> : null}
      </View>
    </View>
  );
};

const CompanyVerificationBlock = ({ verification }) => {
  const { colors } = useTheme();
  if (!verification) return null;
  const lvl = levelMeta[verification.verificationLevel] || levelMeta.unknown;
  const company = verification.company || {};
  const lvlColor = rowColor(colors, lvl.color);

  const rows = [
    { label: 'Company Identity', status: verification.companyIdentity?.status, detail: verification.companyIdentity?.detail },
    { label: 'Job Posting', status: verification.jobPosting?.status, detail: verification.jobPosting?.detail },
    { label: 'Domain', status: verification.domainVerification?.status, detail: verification.domainVerification?.detail },
    { label: 'Recruiter Email', status: verification.emailVerification?.status, detail: verification.emailVerification?.detail },
  ];

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          <Ionicons name="shield-checkmark" size={16} color={colors.primary} />  Company Verification
        </Text>
        <View style={[styles.badge, { backgroundColor: lvlColor }]}>
          <Text style={styles.badgeText}>{lvl.label}</Text>
        </View>
      </View>

      {!!company.officialName && (
        <Text style={[styles.companyLine, { color: colors.text }]} numberOfLines={1}>
          {company.officialName}{company.industry ? ` · ${company.industry}` : ''}
        </Text>
      )}

      <Text style={[styles.note, { color: colors.textMuted }]}>
        A real company is NOT proof the job is real. These checks show how well the posting&apos;s identity, domain and email match the Trusted Company Database.
      </Text>

      {rows.map((r, i) => <Row key={i} colors={colors} {...r} />)}

      {verification.verificationLevel === 'unknown' && (
        <Text style={[styles.unknownNote, { color: colors.textMuted }]}>
          Not in JobShield&apos;s Trusted Company Database — no trust percentage is shown for unknown companies.
          Below is the basic information found for this company online:
        </Text>
      )}

      {!!verification.webInfo && (
        <View style={[styles.webInfoBox, { borderColor: colors.borderLight, backgroundColor: colors.surfaceHover || colors.surface }]}>
          {!!verification.webInfo.name && (
            <Text style={[styles.webInfoName, { color: colors.text }]}>{verification.webInfo.name}</Text>
          )}
          {!!verification.webInfo.description && (
            <Text style={[styles.webInfoDesc, { color: colors.textSecondary }]}>
              {verification.webInfo.description.length > 350
                ? `${verification.webInfo.description.slice(0, 350)}…`
                : verification.webInfo.description}
            </Text>
          )}
          <View style={styles.webInfoMeta}>
            {!!verification.webInfo.source && (
              <Text style={[styles.webInfoSource, { color: colors.textMuted }]}>Source: {verification.webInfo.source}</Text>
            )}
            {!!verification.webInfo.url && (
              <TouchableOpacity onPress={() => Linking.openURL(verification.webInfo.url)}>
                <Text style={[styles.webInfoLink, { color: colors.primary }]}>
                  Learn more <Ionicons name="open-outline" size={12} color={colors.primary} />
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {!!company.officialDomain && (
        <View style={styles.domainRow}>
          <Text style={[styles.domainLabel, { color: colors.textSecondary }]}>Official domain: </Text>
          <Text style={[styles.domainValue, { color: colors.primary }]}>{company.officialDomain}</Text>
        </View>
      )}
      {!!company.careersUrl && (
        <TouchableOpacity onPress={() => Linking.openURL(company.careersUrl)}>
          <Text style={[styles.careersLink, { color: colors.primary }]}>
            Open official careers page <Ionicons name="open-outline" size={12} color={colors.primary} />
          </Text>
        </TouchableOpacity>
      )}

      {verification.impersonationDetected && (
        <Text style={[styles.impersonation, { color: colors.error }]}>
          <Ionicons name="warning" size={14} color={colors.error} />  Domain impersonation detected — {verification.domainVerification?.detail || 'lookalike domain found'}
        </Text>
      )}

      {!!verification.recommendation && (
        <Text style={[styles.recommendation, { color: colors.textSecondary }]}>
          <Text style={[styles.recLabel, { color: colors.text }]}>What to do: </Text>
          {verification.recommendation}
        </Text>
      )}

      {(verification.warnings || []).map((w, i) => (
        <Text key={i} style={[styles.warning, { color: colors.error }]}>{w}</Text>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontSize: typography.lg, fontWeight: '700' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: typography.xs, fontWeight: '700' },
  companyLine: { fontSize: typography.md, fontWeight: '600', marginBottom: 2 },
  note: { fontSize: typography.xs, lineHeight: 16, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 7, borderBottomWidth: 1 },
  rowIcon: { marginTop: 2, marginRight: spacing.sm },
  rowBody: { flex: 1 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { fontSize: typography.md, fontWeight: '600' },
  rowStatus: { fontSize: typography.md, fontWeight: '700' },
  rowDetail: { fontSize: typography.xs, lineHeight: 16, marginTop: 1 },
  unknownNote: { fontSize: typography.xs, lineHeight: 16, marginTop: spacing.sm, fontStyle: 'italic' },
  webInfoBox: { marginTop: spacing.sm, padding: spacing.sm, borderRadius: 8, borderWidth: 1 },
  webInfoName: { fontSize: typography.md, fontWeight: '700' },
  webInfoDesc: { fontSize: typography.xs, lineHeight: 16, marginTop: 3 },
  webInfoMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  webInfoSource: { fontSize: typography.xs, flexShrink: 1 },
  webInfoLink: { fontSize: typography.sm, textDecorationLine: 'underline' },
  domainRow: { flexDirection: 'row', marginTop: spacing.sm },
  domainLabel: { fontSize: typography.sm },
  domainValue: { fontSize: typography.sm, fontWeight: '600' },
  careersLink: { fontSize: typography.sm, marginTop: 2, textDecorationLine: 'underline' },
  impersonation: { fontSize: typography.sm, marginTop: spacing.sm, fontWeight: '600' },
  recommendation: { fontSize: typography.md, lineHeight: 20, marginTop: spacing.sm },
  recLabel: { fontWeight: '700' },
  warning: { fontSize: typography.sm, color: undefined, marginTop: spacing.xs },
});

export default CompanyVerificationBlock;