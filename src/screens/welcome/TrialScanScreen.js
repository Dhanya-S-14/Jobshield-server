import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { detectScam } from '../../utils/scamDetector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RiskScoreCircle from '../../components/common/RiskScoreCircle';
import Card from '../../components/common/Card';
import { getRiskLevel } from '../../utils/helpers';

const TrialScanScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!jobTitle.trim()) errs.jobTitle = 'Job title is required';
    if (!companyName.trim()) errs.companyName = 'Company name is required';
    if (!jobDescription.trim()) errs.jobDescription = 'Job description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const analysisResult = detectScam({
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
        jobDescription: jobDescription.trim(),
      });
      setResult(analysisResult);
      await AsyncStorage.setItem('trialUsed', 'true');
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Analysis Failed', text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  const riskLevel = result ? getRiskLevel(result.riskScore) : 'unknown';

  if (result) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.trialBanner, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="information-circle" size={16} color={colors.warning} />
            <Text style={[styles.trialBannerText, { color: colors.textSecondary }]}>Free trial scan</Text>
          </View>

          <View style={styles.scoreSection}>
            <RiskScoreCircle score={result.riskScore} size={120} strokeWidth={10} />
            <Text style={[styles.riskLabel, { color: result.riskScore <= 20 ? colors.success : result.riskScore <= 50 ? colors.warning : colors.error, marginTop: spacing.md }]}>
              {riskLevel}
            </Text>
            <Text style={[styles.companyResult, { color: colors.text }]}>{result.companyName}</Text>
            <Text style={[styles.titleResult, { color: colors.textSecondary }]}>{result.jobTitle}</Text>
          </View>

          <Card style={{ marginBottom: spacing.md }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Analysis</Text>
            <Text style={[styles.explanation, { color: colors.textSecondary }]}>{result.explanation}</Text>
          </Card>

          {result.redFlags && result.redFlags.length > 0 && (
            <Card style={{ marginBottom: spacing.md }}>
              <Text style={[styles.cardTitle, { color: colors.error }]}>Red Flags ({result.redFlags.length})</Text>
              {result.redFlags.map((flag, i) => (
                <View key={i} style={styles.flagRow}>
                  <Ionicons name="close-circle" size={16} color={colors.error} />
                  <Text style={[styles.flagText, { color: colors.textSecondary }]}>{flag}</Text>
                </View>
              ))}
            </Card>
          )}

          {result.positiveIndicators && result.positiveIndicators.length > 0 && (
            <Card style={{ marginBottom: spacing.md }}>
              <Text style={[styles.cardTitle, { color: colors.success }]}>Positive Indicators ({result.positiveIndicators.length})</Text>
              {result.positiveIndicators.map((ind, i) => (
                <View key={i} style={styles.flagRow}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={[styles.flagText, { color: colors.textSecondary }]}>{ind}</Text>
                </View>
              ))}
            </Card>
          )}

          {result.recommendation && (
            <Card style={{ marginBottom: spacing.md }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Recommendation</Text>
              <Text style={[styles.explanation, { color: colors.textSecondary }]}>{result.recommendation}</Text>
            </Card>
          )}

          <TouchableOpacity style={[styles.signupBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Auth')}>
            <Ionicons name="person-add-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.signupBtnText}>Sign Up for More Scans</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reScanBtn} onPress={() => { setResult(null); setJobTitle(''); setCompanyName(''); setJobDescription(''); }}>
            <Text style={[styles.reScanText, { color: colors.primary }]}>Scan Another Job</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.heroSection}>
            <View style={[styles.heroIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="scan-outline" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Free Job Scan</Text>
            <Text style={[styles.heroSub, { color: colors.textSecondary }]}>Paste any job details to check for scams</Text>
          </View>

          <View style={[styles.trialBanner, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}>
            <Ionicons name="gift-outline" size={20} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.trialTitle, { color: colors.text }]}>1 Free Scan Available</Text>
              <Text style={[styles.trialSub, { color: colors.textSecondary }]}>Sign up for unlimited scans</Text>
            </View>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Job Title *</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: errors.jobTitle ? colors.error : colors.border }]}>
                <TextInput style={[styles.input, { color: colors.text }]} placeholder="e.g. Software Engineer" placeholderTextColor={colors.textMuted} value={jobTitle} onChangeText={(t) => { setJobTitle(t); if (errors.jobTitle) setErrors({ ...errors, jobTitle: null }); }} />
              </View>
              {errors.jobTitle && <Text style={[styles.errorText, { color: colors.error }]}>{errors.jobTitle}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Company Name *</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: errors.companyName ? colors.error : colors.border }]}>
                <TextInput style={[styles.input, { color: colors.text }]} placeholder="e.g. Google" placeholderTextColor={colors.textMuted} value={companyName} onChangeText={(t) => { setCompanyName(t); if (errors.companyName) setErrors({ ...errors, companyName: null }); }} />
              </View>
              {errors.companyName && <Text style={[styles.errorText, { color: colors.error }]}>{errors.companyName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Job Description *</Text>
              <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: errors.jobDescription ? colors.error : colors.border, minHeight: 120 }]}>
                <TextInput style={[styles.input, { color: colors.text, textAlignVertical: 'top' }]} placeholder="Paste the full job description here..." placeholderTextColor={colors.textMuted} value={jobDescription} onChangeText={(t) => { setJobDescription(t); if (errors.jobDescription) setErrors({ ...errors, jobDescription: null }); }} multiline numberOfLines={6} />
              </View>
              {errors.jobDescription && <Text style={[styles.errorText, { color: colors.error }]}>{errors.jobDescription}</Text>}
            </View>

            <TouchableOpacity style={[styles.analyzeBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]} onPress={handleAnalyze} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="search" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.analyzeBtnText}>Analyze Job</Text>
                </>
              )}
            </TouchableOpacity>
          </Card>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Auth')}>
            <Text style={[styles.loginLinkText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <Text style={[styles.loginLinkBold, { color: colors.primary }]}>Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  backBtn: { marginBottom: spacing.md },
  heroSection: { alignItems: 'center', marginBottom: spacing.lg },
  heroIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  heroTitle: { fontSize: typography.xxl, fontWeight: '800' },
  heroSub: { fontSize: typography.md, marginTop: spacing.xs },
  trialBanner: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.lg, borderWidth: 1, gap: spacing.sm },
  trialTitle: { fontSize: typography.base, fontWeight: '700' },
  trialSub: { fontSize: typography.sm, marginTop: 2 },
  formCard: { padding: spacing.lg },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: typography.sm, fontWeight: '600', marginBottom: spacing.xs, marginLeft: 2 },
  inputWrapper: { borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md },
  input: { paddingVertical: 12, fontSize: typography.md },
  errorText: { fontSize: typography.xs, marginTop: 4, marginLeft: 2 },
  analyzeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: borderRadius.md, marginTop: spacing.sm },
  analyzeBtnText: { color: '#FFFFFF', fontSize: typography.base, fontWeight: '700' },
  loginLink: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  loginLinkText: { fontSize: typography.md },
  loginLinkBold: { fontSize: typography.md, fontWeight: '700' },
  resultScroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  scoreSection: { alignItems: 'center', marginBottom: spacing.lg },
  riskLabel: { fontSize: typography.xl, fontWeight: '800' },
  companyResult: { fontSize: typography.xl, fontWeight: '700', marginTop: spacing.sm },
  titleResult: { fontSize: typography.md, marginTop: 2 },
  cardTitle: { fontSize: typography.lg, fontWeight: '700', marginBottom: spacing.sm },
  explanation: { fontSize: typography.md, lineHeight: 22 },
  flagRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm, gap: spacing.sm },
  flagText: { fontSize: typography.sm, flex: 1, lineHeight: 20 },
  signupBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: borderRadius.md, marginBottom: spacing.md },
  signupBtnText: { color: '#FFFFFF', fontSize: typography.base, fontWeight: '700' },
  reScanBtn: { alignItems: 'center', paddingVertical: 12 },
  reScanText: { fontSize: typography.base, fontWeight: '600' },
});

export default TrialScanScreen;
