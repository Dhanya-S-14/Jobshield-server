import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { verifyCompany } from '../../services/companyService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const getScoreColor = (score, colors) => {
  if (score >= 70) return colors.success;
  if (score >= 40) return colors.warning;
  return colors.error;
};

const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Poor';
  return 'Very Poor';
};

const getSignalColor = (type, colors) => {
  switch (type) {
    case 'positive': return colors.success;
    case 'danger': return colors.error;
    case 'warning': return colors.warning;
    case 'info': return colors.info;
    default: return colors.textMuted;
  }
};

const getSignalIcon = (type) => {
  switch (type) {
    case 'positive': return 'checkmark-circle';
    case 'danger': return 'close-circle';
    case 'warning': return 'warning';
    case 'info': return 'information-circle';
    default: return 'information-circle';
  }
};

const CompanyVerifyScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) { setError(t('companyName') + ' ' + t('required')); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await verifyCompany(query.trim());
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('verifyCompany')}</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.searchSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('checkACompany')}</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {t('verifyIfLegitimate')}
            </Text>
            <View style={[styles.searchBar, { backgroundColor: colors.inputBg, borderColor: error ? colors.error : colors.border }]}>
              <Ionicons name="business-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={t('enterCompanyName')}
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={(t) => { setQuery(t); setError(''); }}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoCapitalize="words"
              />
            </View>
            {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
            <Button title={t('verify')} icon="search" onPress={handleSearch} loading={loading} fullWidth />
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t('analyzingCompany')}</Text>
            </View>
          )}

          {result && !loading && (
            <View>
              {/* Trust Score Circle */}
              <View style={[styles.scoreSection, { backgroundColor: colors.card, borderColor: colors.borderLight }, shadows.md]}>
                <View style={[styles.scoreCircle, { borderColor: getScoreColor(result.trustScore, colors) }]}>
                  <Text style={[styles.scoreNumber, { color: getScoreColor(result.trustScore, colors) }]}>
                    {result.trustScore}
                  </Text>
                  <Text style={styles.scoreMax}>/ 100</Text>
                </View>
                <Text style={[styles.companyName, { color: colors.text }]}>{result.company?.name || query}</Text>
                <Text style={[styles.scoreLabel, { color: getScoreColor(result.trustScore, colors) }]}>
                  {getScoreLabel(result.trustScore)} Trust Score
                </Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.riskBadge, {
                    backgroundColor: result.riskColor === 'green' ? colors.successLight :
                                    result.riskColor === 'orange' ? colors.warningLight :
                                    colors.errorLight
                  }]}>
                    <Text style={[styles.riskBadgeText, {
                      color: result.riskColor === 'green' ? colors.success :
                             result.riskColor === 'orange' ? colors.warning :
                             colors.error
                    }]}>{result.riskLevel}</Text>
                  </View>
                  {result.inDatabase && (
                    <View style={[styles.riskBadge, {
                      backgroundColor: result.verified ? colors.successLight : colors.warningLight
                    }]}>
                      <Text style={[styles.riskBadgeText, {
                        color: result.verified ? colors.success : colors.warning
                      }]}>{result.verified ? 'Verified' : 'Unverified'}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Company Details */}
              <Card style={styles.detailsCard}>
                <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>{t('companyDetails')}</Text>
                {result.company?.website ? (
                  <View style={styles.detailRow}>
                    <Ionicons name="globe-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Website</Text>
                    <Text style={[styles.detailValue, { color: colors.primary }]}>{result.company.website}</Text>
                  </View>
                ) : null}
                {result.company?.industry ? (
                  <View style={styles.detailRow}>
                    <Ionicons name="briefcase-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Industry</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{result.company.industry}</Text>
                  </View>
                ) : null}
                {result.company?.location ? (
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Location</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{result.company.location}</Text>
                  </View>
                ) : null}
                {result.company?.employeeCount ? (
                  <View style={styles.detailRow}>
                    <Ionicons name="people-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Size</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{result.company.employeeCount}</Text>
                  </View>
                ) : null}
                {result.company?.foundedYear ? (
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
                    <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Founded</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{result.company.foundedYear}</Text>
                  </View>
                ) : null}
              </Card>

              {/* Analysis Signals */}
              {result.signals && result.signals.length > 0 && (
                <Card style={styles.signalsCard}>
                  <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>{t('analysisSignals')}</Text>
                  {result.signals.map((signal, i) => (
                    <View key={i} style={[styles.signalRow, i < result.signals.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
                      <Ionicons
                        name={getSignalIcon(signal.type)}
                        size={18}
                        color={getSignalColor(signal.type, colors)}
                        style={styles.signalIcon}
                      />
                      <Text style={[styles.signalText, { color: colors.text }]}>{signal.text}</Text>
                    </View>
                  ))}
                </Card>
              )}
            </View>
          )}

          {!result && !loading && !error && (
            <EmptyState
              icon="shield-checkmark-outline"
              title={t('searchForCompany')}
              subtitle={t('enterCompanyToVerify')}
              iconSize={56}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.sm, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: typography.lg, fontWeight: '700' },
  headerRight: { width: 40 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  searchSection: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: typography.xxl, fontWeight: '700', marginBottom: spacing.xs },
  sectionSubtitle: { fontSize: typography.md, marginBottom: spacing.lg },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  searchInput: { flex: 1, fontSize: typography.base, marginLeft: spacing.sm, paddingVertical: 14 },
  errorText: { fontSize: typography.xs, marginBottom: spacing.sm, marginLeft: 2 },
  loadingContainer: { alignItems: 'center', paddingVertical: spacing.xxl },
  loadingText: { fontSize: typography.md, marginTop: spacing.md },
  scoreSection: { alignItems: 'center', padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, marginBottom: spacing.md },
  scoreCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  scoreNumber: { fontSize: 32, fontWeight: '800', lineHeight: 34 },
  scoreMax: { fontSize: typography.xs, color: '#94A3B8', marginTop: -2 },
  companyName: { fontSize: typography.xl, fontWeight: '700', marginBottom: spacing.xs },
  scoreLabel: { fontSize: typography.sm, fontWeight: '700', marginBottom: spacing.sm },
  badgeRow: { flexDirection: 'row', gap: 8 },
  riskBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: borderRadius.full },
  riskBadgeText: { fontSize: typography.xs, fontWeight: '700' },
  detailsCard: { padding: spacing.lg, marginBottom: spacing.md },
  signalsCard: { padding: spacing.lg, marginBottom: spacing.md },
  cardTitle: { fontSize: typography.sm, fontWeight: '600', marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm + 2 },
  detailLabel: { fontSize: typography.sm, marginLeft: spacing.sm, width: 70 },
  detailValue: { fontSize: typography.sm, fontWeight: '600', flex: 1, textAlign: 'right' },
  signalRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.sm + 2 },
  signalIcon: { marginRight: spacing.sm, marginTop: 1 },
  signalText: { fontSize: typography.sm, flex: 1, lineHeight: 20 },
});

export default CompanyVerifyScreen;
