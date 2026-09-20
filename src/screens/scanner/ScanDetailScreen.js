import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { getScanById, deleteScan, saveScan } from '../../services/scanService';
import { formatDateFull, getRiskLevel, getRiskColor, getRiskLabel } from '../../utils/helpers';
import { shareScanResult } from '../../utils/shareUtils';
import RiskScoreCircle from '../../components/common/RiskScoreCircle';
import RiskBadge from '../../components/common/RiskBadge';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Loader from '../../components/common/Loader';
import { CommentSection } from '../../components/comments/Comments';
import { ScanWarnings } from '../../components/warning/WarningBanner';

const ScanDetailScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { scanId } = route.params || {};
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchScan = useCallback(async () => {
    if (!scanId) { setError('No scan ID provided'); setLoading(false); return; }
    try {
      const data = await getScanById(scanId);
      setScan(data.scan || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [scanId]);

  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!scan?._id) return;
    setSaving(true);
    try {
      await saveScan(scan._id);
      Toast.show({ type: 'success', text1: t('saved') });
    } catch (err) {
      Toast.show({ type: 'error', text1: t('saveFailed'), text2: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      await shareScanResult(scan);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Share Failed', text2: err.message });
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteScan(scan._id);
      Toast.show({ type: 'success', text1: 'Deleted' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Delete Failed', text2: err.message });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <View style={[styles.container, { backgroundColor: colors.background }]}><Loader fullScreen /></View>;
  if (error) return (
    <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      <Button title="Go Back" variant="outline" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
    </View>
  );
  if (!scan) return null;

  const level = getRiskLevel(scan.riskScore);
  const analysis = scan.analysis || {};
  const categories = analysis.categories || [];
  const originalInput = scan.originalInput || scan;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('scanResult')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.scoreCard}>
          <View style={styles.scoreSection}>
            <RiskScoreCircle score={scan.riskScore} size={150} strokeWidth={14} />
            <RiskBadge level={level} score={scan.riskScore} size="lg" style={{ marginTop: spacing.md }} />
            <Text style={[styles.companyName, { color: colors.text }]}>{scan.companyName}</Text>
            <Text style={[styles.jobTitle, { color: colors.textSecondary }]}>{scan.jobTitle}</Text>
            {scan.createdAt && <Text style={[styles.dateText, { color: colors.textMuted }]}>{formatDateFull(scan.createdAt)}</Text>}
          </View>
        </Card>

        <Card style={styles.explanationCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('aiAnalysis')}</Text>
          <Text style={[styles.explanationText, { color: colors.textSecondary }]}>
            {analysis.explanation || scan.explanation || t('noDetailedExplanation')}
          </Text>
        </Card>

        {categories.length > 0 && (
          <Card style={styles.sectionCard}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('analysisBreakdown')}</Text>
            {categories.map((cat, idx) => (
              <View key={idx}>
                <TouchableOpacity style={[styles.categoryHeader, { borderBottomColor: colors.borderLight }]} onPress={() => toggleSection(`cat_${idx}`)}>
                  <View style={styles.categoryTitleRow}>
                    <View style={[styles.categoryDot, { backgroundColor: cat.risk === 'high' ? colors.error : cat.risk === 'medium' ? colors.warning : colors.success }]} />
                    <Text style={[styles.categoryName, { color: colors.text }]}>{cat.name}</Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={[styles.categoryRisk, { color: cat.risk === 'high' ? colors.error : cat.risk === 'medium' ? colors.warning : colors.success }]}>
                      {cat.score || ''}
                    </Text>
                    <Ionicons name={expandedSections[`cat_${idx}`] ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>
                {expandedSections[`cat_${idx}`] && (
                  <View style={styles.categoryContent}>
                    {(cat.findings || []).map((finding, fidx) => (
                      <View key={fidx} style={[styles.findingRow, { borderBottomColor: colors.borderLight }]}>
                        <Ionicons name={finding.positive ? 'checkmark-circle' : 'close-circle'} size={16} color={finding.positive ? colors.success : colors.error} />
                        <Text style={[styles.findingText, { color: colors.textSecondary }]}>{finding.text}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </Card>
        )}

        <Card style={styles.sectionCard}>
          <TouchableOpacity style={styles.categoryHeader} onPress={() => toggleSection('original')}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Original Input</Text>
            <Ionicons name={expandedSections.original ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
          </TouchableOpacity>
          {expandedSections.original && (
            <View style={styles.originalContent}>
              {Object.entries({
                'Job Title': originalInput.jobTitle,
                'Company': originalInput.companyName,
                'Description': originalInput.jobDescription,
                'Salary': originalInput.salary,
                'Location': originalInput.location,
                'Job Type': originalInput.jobType,
                'Experience': originalInput.experience,
                'Recruiter Name': originalInput.recruiterName,
                'Recruiter Email': originalInput.recruiterEmail,
                'Phone': originalInput.phoneNumber,
                'Website': originalInput.website,
                'Skills': originalInput.skills,
                'Apply Link': originalInput.applyLink,
              }).map(([key, val]) => (
                val ? <View key={key} style={styles.originalRow}>
                  <Text style={[styles.originalLabel, { color: colors.textMuted }]}>{key}</Text>
                  <Text style={[styles.originalValue, { color: colors.text }]}>{val}</Text>
                </View> : null
              ))}
            </View>
          )}
        </Card>

        <ScanWarnings companyName={scan.companyName} jobDescription={scan.jobDescription} />

        <View style={styles.actionRow}>
          <Button title={t('saveResult')} icon="bookmark-outline" variant="primary" onPress={handleSave} loading={saving} style={styles.actionBtn} />
          <Button title="Share" icon="share-outline" variant="outline" onPress={handleShare} style={styles.actionBtn} />
          <Button title={t('delete')} icon="trash-outline" variant="danger" onPress={() => setShowDeleteConfirm(true)} style={styles.actionBtn} />
        </View>

        <View style={{ marginTop: spacing.md }}>
          <CommentSection scanId={scan._id} companyName={scan.companyName} />
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Scan"
        message="Are you sure you want to delete this scan? This action cannot be undone."
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        destructive
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.sm, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: typography.lg, fontWeight: '700' },
  headerRight: { width: 40 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  scoreCard: { marginBottom: spacing.md },
  scoreSection: { alignItems: 'center', paddingVertical: spacing.md },
  companyName: { fontSize: typography.xl, fontWeight: '700', marginTop: spacing.md },
  jobTitle: { fontSize: typography.md, marginTop: 2 },
  dateText: { fontSize: typography.sm, marginTop: spacing.xs },
  explanationCard: { marginBottom: spacing.md },
  cardTitle: { fontSize: typography.lg, fontWeight: '700', marginBottom: spacing.sm },
  explanationText: { fontSize: typography.md, lineHeight: 22 },
  sectionCard: { marginBottom: spacing.md },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1 },
  categoryTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  categoryName: { fontSize: typography.md, fontWeight: '600', flex: 1 },
  categoryRight: { flexDirection: 'row', alignItems: 'center' },
  categoryRisk: { fontSize: typography.sm, fontWeight: '600', marginRight: spacing.sm },
  categoryContent: { paddingLeft: spacing.md, paddingBottom: spacing.sm },
  findingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1 },
  findingText: { fontSize: typography.sm, marginLeft: spacing.sm, flex: 1 },
  originalContent: { paddingTop: spacing.sm },
  originalRow: { flexDirection: 'row', marginBottom: spacing.sm },
  originalLabel: { fontSize: typography.sm, fontWeight: '600', width: 110 },
  originalValue: { fontSize: typography.sm, flex: 1 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { flex: 1 },
  errorText: { fontSize: typography.md, textAlign: 'center', paddingHorizontal: spacing.xl },
});

export default ScanDetailScreen;
