import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { scanJob, saveScan } from '../../services/scanService';
import RiskScoreCircle from '../../components/common/RiskScoreCircle';
import RiskBadge from '../../components/common/RiskBadge';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getRiskLevel, getRiskLabel } from '../../utils/helpers';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Remote'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Manager', 'Director'];

const ScannerScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [form, setForm] = useState({
    jobTitle: '', companyName: '', jobDescription: '', salary: '', location: '',
    jobType: '', recruiterName: '', recruiterEmail: '', phoneNumber: '',
    website: '', experience: '', skills: '', applyLink: '',
    ...(route?.params?.prefill || {}),
  });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const scrollRef = useRef(null);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.jobTitle.trim()) errs.jobTitle = t('jobTitle') + ' ' + t('required');
    if (!form.companyName.trim()) errs.companyName = t('companyName') + ' ' + t('required');
    if (!form.jobDescription.trim()) errs.jobDescription = t('jobDescription') + ' ' + t('required');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await scanJob(form);
      setResult(data.scan || data);
      setStep('result');
      setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
    } catch (err) {
      Toast.show({ type: 'error', text1: t('scanFailed'), text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result?._id) return;
    setSaving(true);
    try {
      await saveScan(result._id);
      Toast.show({ type: 'success', text1: t('saved'), text2: t('resultSaved') });
    } catch (err) {
      Toast.show({ type: 'error', text1: t('saveFailed'), text2: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleScanAgain = () => {
    setStep('form');
    setResult(null);
    setExpandedSections({});
    setForm({ jobTitle: '', companyName: '', jobDescription: '', salary: '', location: '', jobType: '', recruiterName: '', recruiterEmail: '', phoneNumber: '', website: '', experience: '', skills: '', applyLink: '' });
  };

  const riskLevel = result ? getRiskLevel(result.riskScore) : 'unknown';

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (step === 'result' && result) {
    const analysis = result.analysis || {};
    const categories = analysis.categories || [];
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.resultHeader, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>{t('scanResult')}</Text>
        </View>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.scoreSection}>
            <RiskScoreCircle score={result.riskScore} size={140} strokeWidth={12} />
            <RiskBadge level={riskLevel} score={result.riskScore} size="lg" style={{ marginTop: spacing.md }} />
            <Text style={[styles.companyName, { color: colors.text }]}>{result.companyName}</Text>
            <Text style={[styles.jobTitle, { color: colors.textSecondary }]}>{result.jobTitle}</Text>
          </View>

          <Card style={styles.explanationCard}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('aiAnalysis')}</Text>
            <Text style={[styles.explanationText, { color: colors.textSecondary }]}>
              {analysis.explanation || result.explanation || t('noDetailedExplanation')}
            </Text>
          </Card>

          {categories.length > 0 && (
            <Card style={styles.breakdownCard}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t('analysisBreakdown')}</Text>
              {categories.map((cat, idx) => (
                <View key={idx}>
                  <TouchableOpacity style={styles.categoryHeader} onPress={() => toggleSection(`cat_${idx}`)}>
                    <View style={styles.categoryTitleRow}>
                      <Ionicons
                        name={cat.risk === 'high' ? 'warning' : cat.risk === 'medium' ? 'alert-circle' : 'checkmark-circle'}
                        size={20}
                        color={cat.risk === 'high' ? colors.error : cat.risk === 'medium' ? colors.warning : colors.success}
                      />
                      <Text style={[styles.categoryName, { color: colors.text }]}>{cat.name}</Text>
                    </View>
                    <Ionicons name={expandedSections[`cat_${idx}`] ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                  {expandedSections[`cat_${idx}`] && (
                    <View style={styles.categoryContent}>
                      {(cat.findings || []).map((finding, fidx) => (
                        <View key={fidx} style={[styles.findingRow, { borderBottomColor: colors.borderLight }]}>
                          <Ionicons
                            name={finding.positive ? 'checkmark-circle' : 'close-circle'}
                            size={16}
                            color={finding.positive ? colors.success : colors.error}
                          />
                          <Text style={[styles.findingText, { color: colors.textSecondary }]}>{finding.text}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </Card>
          )}

          <View style={styles.actionRow}>
            <Button title={t('saveResult')} icon="bookmark-outline" variant="primary" onPress={handleSave} loading={saving} style={styles.actionBtn} />
            <Button title={t('scanAgain')} icon="refresh-outline" variant="outline" onPress={handleScanAgain} style={styles.actionBtn} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.formHeaderSection}>
            <View style={[styles.formLogo, { backgroundColor: colors.primaryLight + '20' }]}>
              <Ionicons name="shield-checkmark" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.formTitle, { color: colors.text }]}>{t('jobScanner')}</Text>
            <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
              {t('pasteJobDetails')}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.screenshotCard, { backgroundColor: colors.primaryLight + '10', borderColor: colors.primary + '30' }]}
            onPress={() => navigation.navigate('ScreenshotScan')}
          >
            <Ionicons name="camera-outline" size={28} color={colors.primary} />
            <View style={styles.screenshotInfo}>
              <Text style={[styles.screenshotTitle, { color: colors.primary }]}>{t('scanFromScreenshot')}</Text>
              <Text style={[styles.screenshotDesc, { color: colors.textSecondary }]}>{t('scanScreenshotDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          </TouchableOpacity>

          <Card style={styles.formCard}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('jobInformation')}</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('jobTitle')} <Text style={{ color: colors.error }}>*</Text></Text>
              <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: errors.jobTitle ? colors.error : colors.border }]}>
                <TextInput style={[styles.fieldText, { color: colors.text }]} placeholder="e.g. Software Engineer" placeholderTextColor={colors.textMuted} value={form.jobTitle} onChangeText={(t) => updateField('jobTitle', t)} />
              </View>
              {errors.jobTitle && <Text style={[styles.fieldError, { color: colors.error }]}>{errors.jobTitle}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('companyName')} <Text style={{ color: colors.error }}>*</Text></Text>
              <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: errors.companyName ? colors.error : colors.border }]}>
                <TextInput style={[styles.fieldText, { color: colors.text }]} placeholder="e.g. Google" placeholderTextColor={colors.textMuted} value={form.companyName} onChangeText={(t) => updateField('companyName', t)} />
              </View>
              {errors.companyName && <Text style={[styles.fieldError, { color: colors.error }]}>{errors.companyName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('jobDescription')} <Text style={{ color: colors.error }}>*</Text></Text>
              <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: errors.jobDescription ? colors.error : colors.border, minHeight: 100 }]}>
                <TextInput style={[styles.fieldText, { color: colors.text }]} placeholder="Paste the job description here..." placeholderTextColor={colors.textMuted} value={form.jobDescription} onChangeText={(t) => updateField('jobDescription', t)} multiline numberOfLines={5} textAlignVertical="top" />
              </View>
              {errors.jobDescription && <Text style={[styles.fieldError, { color: colors.error }]}>{errors.jobDescription}</Text>}
            </View>

            <View style={styles.row}>
              <View style={[styles.halfInput, { marginRight: spacing.sm }]}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Salary</Text>
                <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <TextInput style={[styles.fieldText, { color: colors.text }]} placeholder="e.g. 100000" placeholderTextColor={colors.textMuted} value={form.salary} onChangeText={(t) => updateField('salary', t)} keyboardType="numeric" />
                </View>
              </View>
              <View style={[styles.halfInput, { marginLeft: spacing.sm }]}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Location</Text>
                <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <TextInput style={[styles.fieldText, { color: colors.text }]} placeholder="e.g. New York" placeholderTextColor={colors.textMuted} value={form.location} onChangeText={(t) => updateField('location', t)} />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.halfInput, { marginRight: spacing.sm }]}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Job Type</Text>
                <View style={[styles.pickerWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {JOB_TYPES.map((type) => (
                      <TouchableOpacity key={type} style={[styles.chip, { backgroundColor: form.jobType === type ? colors.primary : colors.border }]} onPress={() => updateField('jobType', form.jobType === type ? '' : type)}>
                        <Text style={[styles.chipText, { color: form.jobType === type ? '#FFFFFF' : colors.text }]}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
              <View style={[styles.halfInput, { marginLeft: spacing.sm }]}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Experience</Text>
                <View style={[styles.pickerWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {EXPERIENCE_LEVELS.map((exp) => (
                      <TouchableOpacity key={exp} style={[styles.chip, { backgroundColor: form.experience === exp ? colors.primary : colors.border }]} onPress={() => updateField('experience', form.experience === exp ? '' : exp)}>
                        <Text style={[styles.chipText, { color: form.experience === exp ? '#FFFFFF' : colors.text }]}>{exp}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.text, marginTop: spacing.md }]}>{t('recruiterInformation')}</Text>

            <View style={styles.row}>
              <View style={[styles.halfInput, { marginRight: spacing.sm }]}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Recruiter Name</Text>
                <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <TextInput style={[styles.fieldText, { color: colors.text }]} placeholder="Full name" placeholderTextColor={colors.textMuted} value={form.recruiterName} onChangeText={(t) => updateField('recruiterName', t)} />
                </View>
              </View>
              <View style={[styles.halfInput, { marginLeft: spacing.sm }]}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Recruiter Email</Text>
                <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <TextInput style={[styles.fieldText, { color: colors.text }]} placeholder="email@company.com" placeholderTextColor={colors.textMuted} value={form.recruiterEmail} onChangeText={(t) => updateField('recruiterEmail', t)} keyboardType="email-address" autoCapitalize="none" />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.halfInput, { marginRight: spacing.sm }]}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Phone Number</Text>
                <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <TextInput style={[styles.fieldText, { color: colors.text }]} placeholder="Phone" placeholderTextColor={colors.textMuted} value={form.phoneNumber} onChangeText={(t) => updateField('phoneNumber', t)} keyboardType="phone-pad" />
                </View>
              </View>
              <View style={[styles.halfInput, { marginLeft: spacing.sm }]}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Website</Text>
                <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <TextInput style={[styles.fieldText, { color: colors.text }]} placeholder="https://" placeholderTextColor={colors.textMuted} value={form.website} onChangeText={(t) => updateField('website', t)} autoCapitalize="none" />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Skills</Text>
              <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput style={[styles.fieldText, { color: colors.text }]} placeholder="e.g. JavaScript, React, Node.js (comma separated)" placeholderTextColor={colors.textMuted} value={form.skills} onChangeText={(t) => updateField('skills', t)} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Apply Link</Text>
              <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput style={[styles.fieldText, { color: colors.text }]} placeholder="https://" placeholderTextColor={colors.textMuted} value={form.applyLink} onChangeText={(t) => updateField('applyLink', t)} autoCapitalize="none" />
              </View>
            </View>

            <Button title={t('analyzeJobBtn')} icon="search" loading={loading} onPress={handleAnalyze} size="lg" style={styles.analyzeButton} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  formHeaderSection: { alignItems: 'center', marginBottom: spacing.lg },
  formLogo: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  formTitle: { fontSize: typography.xxl, fontWeight: '800' },
  formSubtitle: { fontSize: typography.sm, color: 'textSecondary', textAlign: 'center', marginTop: spacing.xs },
  formCard: { padding: spacing.lg },
  sectionLabel: { fontSize: typography.base, fontWeight: '700', marginBottom: spacing.md },
  inputGroup: { marginBottom: spacing.md },
  fieldLabel: { fontSize: typography.sm, fontWeight: '600', marginBottom: spacing.xs, marginLeft: 2 },
  fieldInput: { borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md },
  fieldText: { paddingVertical: 12, fontSize: typography.md },
  fieldError: { fontSize: typography.xs, marginTop: 4, marginLeft: 2 },
  row: { flexDirection: 'row', marginBottom: spacing.sm },
  halfInput: { flex: 1 },
  pickerWrapper: { borderRadius: borderRadius.md, borderWidth: 1, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.full, marginRight: spacing.xs },
  chipText: { fontSize: typography.xs, fontWeight: '600' },
  analyzeButton: { marginTop: spacing.md },
  screenshotCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, marginBottom: spacing.lg, gap: spacing.md },
  screenshotInfo: { flex: 1 },
  screenshotTitle: { fontSize: typography.base, fontWeight: '700' },
  screenshotDesc: { fontSize: typography.xs, marginTop: 2 },
  resultHeader: { borderBottomWidth: 1, paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.md, alignItems: 'center' },
  resultTitle: { fontSize: typography.lg, fontWeight: '700' },
  resultScroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  scoreSection: { alignItems: 'center', marginBottom: spacing.lg },
  companyName: { fontSize: typography.xl, fontWeight: '700', marginTop: spacing.sm },
  jobTitle: { fontSize: typography.md, marginTop: 2 },
  explanationCard: { marginBottom: spacing.md },
  cardTitle: { fontSize: typography.lg, fontWeight: '700', marginBottom: spacing.sm },
  explanationText: { fontSize: typography.md, lineHeight: 22 },
  breakdownCard: { marginBottom: spacing.md },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: 'transparent' },
  categoryTitleRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  categoryName: { fontSize: typography.md, fontWeight: '600', marginLeft: spacing.sm },
  categoryContent: { paddingLeft: spacing.lg, paddingBottom: spacing.sm },
  findingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1 },
  findingText: { fontSize: typography.sm, marginLeft: spacing.sm, flex: 1 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { flex: 1 },
});

export default ScannerScreen;
