import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Image, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { extractTextFromImage } from '../../services/ocrService';
import { parseJobText } from '../../utils/textParser';
import { scanJob } from '../../services/scanService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RiskScoreCircle from '../../components/common/RiskScoreCircle';
import RiskBadge from '../../components/common/RiskBadge';
import CompanyVerificationBlock from './CompanyVerificationBlock';
import { getRiskLevel } from '../../utils/helpers';

const PARSED_FIELDS = [
  { key: 'jobTitle', label: 'Job Title', icon: 'briefcase-outline' },
  { key: 'companyName', label: 'Company', icon: 'business-outline' },
  { key: 'salary', label: 'Salary', icon: 'cash-outline' },
  { key: 'location', label: 'Location', icon: 'location-outline' },
  { key: 'jobType', label: 'Job Type', icon: 'time-outline' },
  { key: 'experienceLevel', label: 'Experience', icon: 'trending-up-outline' },
  { key: 'recruiterEmail', label: 'Email', icon: 'mail-outline' },
  { key: 'phoneNumber', label: 'Phone', icon: 'call-outline' },
  { key: 'website', label: 'Website', icon: 'globe-outline' },
  { key: 'applyLink', label: 'Apply Link', icon: 'link-outline' },
];

const ScreenshotScanScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [step, setStep] = useState('pick');
  const [imageUri, setImageUri] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');
  const [rawText, setRawText] = useState('');
  const [editedText, setEditedText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [parsedFields, setParsedFields] = useState({});
  const [editingField, setEditingField] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const pickFromGallery = async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Toast.show({ type: 'error', text1: t('permissionDenied'), text2: t('permissionRequired') });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
      setStep('preview');
    }
  };

  const takePhoto = async () => {
    const permResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permResult.granted) {
      Toast.show({ type: 'error', text1: t('permissionDenied'), text2: t('permissionRequired') });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
      setStep('preview');
    }
  };

  const runOcr = async () => {
    if (!imageUri) return;
    setOcrLoading(true);
    setOcrProgress('Sending image to server...');
    try {
      setOcrProgress('Preprocessing image...');
      const response = await extractTextFromImage(imageUri);
      const data = response.data;
      setRawText(data.text);
      setEditedText(data.text);
      setConfidence(data.confidence);

      setOcrProgress('Parsing job details...');
      const parsed = parseJobText(data.text);
      setParsedFields(parsed);

      setStep('review');
      Toast.show({ type: 'success', text1: 'Text Extracted', text2: `${data.wordCount} words found (${data.confidence}% confidence)` });
    } catch (err) {
      Toast.show({ type: 'error', text1: t('ocrFailed'), text2: err.message });
      setStep('preview');
    } finally {
      setOcrLoading(false);
      setOcrProgress('');
    }
  };

  const updateParsedField = (key, value) => {
    setParsedFields(prev => ({ ...prev, [key]: value }));
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const scanData = {
        jobTitle: parsedFields.jobTitle || '',
        companyName: parsedFields.companyName || '',
        jobDescription: editedText || rawText,
        salary: parsedFields.salary || '',
        location: parsedFields.location || '',
        jobType: parsedFields.jobType || '',
        recruiterEmail: parsedFields.recruiterEmail || '',
        phoneNumber: parsedFields.phoneNumber || '',
        website: parsedFields.website || '',
        experienceLevel: parsedFields.experienceLevel || '',
        applyLink: parsedFields.applyLink || '',
      };
      const data = await scanJob(scanData);
      setResult(data.scan || data);
      setStep('result');
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Analysis Failed', text2: err.message });
    } finally {
      setAnalyzing(false);
    }
  };

  const useInScanner = () => {
    navigation.navigate('MainTabs', {
      screen: 'Scanner',
      params: {
        prefill: {
          jobTitle: parsedFields.jobTitle || '',
          companyName: parsedFields.companyName || '',
          jobDescription: editedText || rawText,
          salary: parsedFields.salary || '',
          location: parsedFields.location || '',
          jobType: parsedFields.jobType || '',
          recruiterEmail: parsedFields.recruiterEmail || '',
          phoneNumber: parsedFields.phoneNumber || '',
          website: parsedFields.website || '',
          experience: parsedFields.experienceLevel || '',
          applyLink: parsedFields.applyLink || '',
        },
      },
    });
  };

  const resetAll = () => {
    setStep('pick');
    setImageUri(null);
    setRawText('');
    setEditedText('');
    setConfidence(0);
    setParsedFields({});
    setResult(null);
  };

  const getConfidenceColor = () => {
    if (confidence >= 85) return colors.success;
    if (confidence >= 60) return colors.warning;
    return colors.error;
  };

  if (step === 'result' && result) {
    const riskLevel = getRiskLevel(result.riskScore);
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
          <TouchableOpacity onPress={resetAll} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('scanResult')}</Text>
          <View style={styles.headerRight} />
        </View>
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.scoreSection}>
            <RiskScoreCircle score={result.riskScore} size={140} strokeWidth={12} />
            <RiskBadge level={riskLevel} score={result.riskScore} size="lg" style={{ marginTop: spacing.md }} />
            <Text style={[styles.resultCompany, { color: colors.text }]}>{result.companyName}</Text>
            <Text style={[styles.resultJob, { color: colors.textSecondary }]}>{result.jobTitle}</Text>
          </View>
          <Card style={{ padding: spacing.lg, marginBottom: spacing.md }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('aiAnalysis')}</Text>
            <Text style={[styles.explanationText, { color: colors.textSecondary }]}>
              {result.analysis?.explanation || result.explanation || t('noDetailedExplanation')}
            </Text>
          </Card>
          <CompanyVerificationBlock verification={result.companyVerification} />
          <View style={styles.resultActions}>
            <Button title="Scan Another" icon="refresh-outline" variant="outline" onPress={resetAll} style={styles.resultBtn} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('scanFromScreenshot')}</Text>
        <View style={styles.headerRight} />
      </View>

      {step === 'pick' && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={[styles.heroIcon, { backgroundColor: colors.primaryLight + '20' }]}>
              <Ionicons name="camera-outline" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>{t('scanFromScreenshot')}</Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              {t('scanScreenshotDesc')}
            </Text>
          </View>

          <Card style={styles.pickCard}>
            <TouchableOpacity style={[styles.pickOption, { borderBottomColor: colors.borderLight }]} onPress={takePhoto}>
              <View style={[styles.pickIcon, { backgroundColor: colors.primaryLight + '20' }]}>
                <Ionicons name="camera" size={24} color={colors.primary} />
              </View>
              <View style={styles.pickInfo}>
                <Text style={[styles.pickTitle, { color: colors.text }]}>{t('camera')}</Text>
                <Text style={[styles.pickDesc, { color: colors.textSecondary }]}>{t('scanScreenshotDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickOption} onPress={pickFromGallery}>
              <View style={[styles.pickIcon, { backgroundColor: colors.successLight + '20' }]}>
                <Ionicons name="images" size={24} color={colors.success || '#10B981'} />
              </View>
              <View style={styles.pickInfo}>
                <Text style={[styles.pickTitle, { color: colors.text }]}>{t('gallery')}</Text>
                <Text style={[styles.pickDesc, { color: colors.textSecondary }]}>{t('selectImage')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </Card>

          <View style={styles.tipsCard}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>Tips for best results:</Text>
            {['Use clear, well-lit screenshots', 'Make sure text is readable and not blurry', 'Crop to just the job posting area', 'Higher resolution = better accuracy'].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {step === 'preview' && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {ocrLoading ? (
            <Card style={styles.loadingCard}>
              <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: spacing.md }} />
              <Text style={[styles.loadingTitle, { color: colors.text }]}>{t('extractingText')}</Text>
              <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>{ocrProgress}</Text>
            </Card>
          ) : (
            <>
              <Card style={styles.previewCard}>
                <Text style={[styles.previewLabel, { color: colors.text }]}>Selected Image</Text>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
                  <TouchableOpacity style={styles.retakeBtn} onPress={resetAll}>
                    <Ionicons name="refresh" size={18} color="#fff" />
                    <Text style={styles.retakeBtnText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              </Card>
              <Button title="Extract Text from Image" icon="text-outline" onPress={runOcr} loading={ocrLoading} size="lg" fullWidth />
            </>
          )}
        </ScrollView>
      )}

      {step === 'review' && (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Card style={styles.confidenceCard}>
              <View style={styles.confidenceRow}>
                <View style={styles.confidenceLeft}>
                  <Text style={[styles.confidenceLabel, { color: colors.text }]}>OCR Confidence</Text>
                  <Text style={[styles.confidenceValue, { color: getConfidenceColor() }]}>{confidence}%</Text>
                </View>
                <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor() + '20' }]}>
                  <Text style={[styles.confidenceBadgeText, { color: getConfidenceColor() }]}>
                    {confidence >= 85 ? 'Excellent' : confidence >= 60 ? 'Good' : 'Low'}
                  </Text>
                </View>
              </View>
            </Card>

            <Card style={styles.fieldsCard}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Extracted Fields</Text>
              {PARSED_FIELDS.map(({ key, label, icon }) => {
                const val = parsedFields[key] || '';
                const isEditing = editingField === key;
                return (
                  <View key={key} style={[styles.fieldRow, { borderBottomColor: colors.borderLight }]}>
                    <View style={styles.fieldHeader}>
                      <Ionicons name={icon} size={16} color={val ? colors.primary : colors.textMuted} />
                      <Text style={[styles.fieldLabel, { color: val ? colors.text : colors.textMuted }]}>{label}</Text>
                      {val ? (
                        <Ionicons name="checkmark-circle" size={16} color={colors.success || '#10B981'} />
                      ) : (
                        <Text style={[styles.missingTag, { color: colors.error }]}>Missing</Text>
                      )}
                    </View>
                    {isEditing ? (
                      <TextInput
                        style={[styles.fieldInput, { color: colors.text, borderColor: colors.primary }]}
                        value={val}
                        onChangeText={(t) => updateParsedField(key, t)}
                        autoFocus
                        onBlur={() => setEditingField(null)}
                      />
                    ) : (
                      <TouchableOpacity onPress={() => setEditingField(key)}>
                        <Text style={[styles.fieldValue, { color: val ? colors.text : colors.textMuted }]}>
                          {val || 'Tap to add'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </Card>

            <Card style={styles.textCard}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Full Extracted Text</Text>
              <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.inputBg }]}
                value={editedText}
                onChangeText={setEditedText}
                multiline
                textAlignVertical="top"
              />
            </Card>

            <View style={styles.actionRow}>
              <Button title={t('runAnalysis')} icon="shield-checkmark" onPress={runAnalysis} loading={analyzing} style={styles.actionBtn} />
              <Button title={t('useInScanner')} icon="create-outline" variant="outline" onPress={useInScanner} style={styles.actionBtn} />
            </View>
            <Button title="Start Over" icon="refresh-outline" variant="ghost" onPress={resetAll} style={{ marginTop: spacing.sm }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: 50, paddingBottom: spacing.sm, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: typography.lg, fontWeight: '700' },
  headerRight: { width: 40 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heroSection: { alignItems: 'center', marginBottom: spacing.xl, marginTop: spacing.lg },
  heroIcon: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  heroTitle: { fontSize: typography.xl, fontWeight: '800', textAlign: 'center' },
  heroSubtitle: { fontSize: typography.sm, textAlign: 'center', marginTop: spacing.xs, lineHeight: 22, paddingHorizontal: spacing.lg },
  pickCard: { padding: 0, marginBottom: spacing.lg, overflow: 'hidden' },
  pickOption: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1 },
  pickIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  pickInfo: { flex: 1 },
  pickTitle: { fontSize: typography.base, fontWeight: '600' },
  pickDesc: { fontSize: typography.xs, marginTop: 2 },
  tipsCard: { padding: spacing.lg },
  tipsTitle: { fontSize: typography.base, fontWeight: '600', marginBottom: spacing.sm },
  tipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  tipText: { fontSize: typography.sm, marginLeft: spacing.sm },
  loadingCard: { padding: spacing.xl, alignItems: 'center' },
  loadingTitle: { fontSize: typography.lg, fontWeight: '700', marginBottom: spacing.xs },
  loadingSubtitle: { fontSize: typography.sm, color: 'textSecondary' },
  previewCard: { padding: spacing.lg, marginBottom: spacing.md },
  previewLabel: { fontSize: typography.sm, fontWeight: '600', marginBottom: spacing.sm },
  imageContainer: { borderRadius: borderRadius.md, overflow: 'hidden', position: 'relative' },
  previewImage: { width: '100%', height: 300, borderRadius: borderRadius.md },
  retakeBtn: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4 },
  retakeBtnText: { color: '#fff', fontSize: typography.xs, fontWeight: '600' },
  confidenceCard: { padding: spacing.md, marginBottom: spacing.md },
  confidenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confidenceLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  confidenceLabel: { fontSize: typography.base, fontWeight: '600' },
  confidenceValue: { fontSize: typography.xl, fontWeight: '800' },
  confidenceBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  confidenceBadgeText: { fontSize: typography.xs, fontWeight: '700' },
  fieldsCard: { padding: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.base, fontWeight: '700', marginBottom: spacing.md },
  fieldRow: { paddingVertical: spacing.sm, borderBottomWidth: 1 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  fieldLabel: { fontSize: typography.sm, fontWeight: '500', flex: 1 },
  missingTag: { fontSize: typography.xs, fontWeight: '600' },
  fieldValue: { fontSize: typography.sm, marginTop: 4, marginLeft: 24 },
  fieldInput: { borderWidth: 1, borderRadius: borderRadius.sm, padding: spacing.sm, marginTop: 4, marginLeft: 24, fontSize: typography.sm },
  textCard: { padding: spacing.lg, marginBottom: spacing.md },
  textArea: { borderWidth: 1, borderRadius: borderRadius.md, padding: spacing.md, fontSize: typography.sm, minHeight: 150, fontFamily: 'monospace' },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { flex: 1 },
  resultScroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  scoreSection: { alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.lg },
  resultCompany: { fontSize: typography.xl, fontWeight: '700', marginTop: spacing.sm },
  resultJob: { fontSize: typography.md, marginTop: 2 },
  cardTitle: { fontSize: typography.lg, fontWeight: '700', marginBottom: spacing.sm },
  explanationText: { fontSize: typography.md, lineHeight: 22 },
  resultActions: { marginTop: spacing.md },
  resultBtn: { flex: 1 },
});

export default ScreenshotScanScreen;
