import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { createReport } from '../../services/reportService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const NewReportScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [form, setForm] = useState({ companyName: '', jobTitle: '', description: '', website: '' });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.companyName.trim()) errs.companyName = t('companyName') + ' ' + t('required');
    if (!form.jobTitle.trim()) errs.jobTitle = t('jobTitle') + ' ' + t('required');
    if (!form.description.trim()) errs.description = t('description') + ' ' + t('required');
    else if (form.description.trim().length < 20) errs.description = 'Please provide at least 20 characters';
    const websiteVal = (form.website || '').trim();
    if (websiteVal && !/^(https?:\/\/|www\.)?.+\..+/.test(websiteVal)) errs.website = 'Please enter a valid URL';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const pickImage = async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Camera roll permission is required' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setPhoto(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const permResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permResult.granted) {
      Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Camera permission is required' });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setPhoto(result.assets[0]);
    }
  };

  const normalizeUrl = (url) => {
    const trimmed = (url || '').trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^www\./i.test(trimmed)) return 'https://' + trimmed;
    if (/^[\w-]+(\.[\w-]+)+/.test(trimmed)) return 'https://' + trimmed;
    return trimmed;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, website: normalizeUrl(form.website), photos: photo ? [photo] : [] };
      await createReport(payload);
      Toast.show({ type: 'success', text1: t('reportSubmitted'), text2: t('thankYouCommunity') });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: t('submissionFailed'), text2: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('reportScam')}</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Card style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('companyName')} <Text style={{ color: colors.error }}>*</Text></Text>
              <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: errors.companyName ? colors.error : colors.border }]}>
                <TextInput style={[styles.fieldText, { color: colors.text }]} placeholder="Name of the company" placeholderTextColor={colors.textMuted} value={form.companyName} onChangeText={(t) => updateField('companyName', t)} />
              </View>
              {errors.companyName && <Text style={[styles.errorText, { color: colors.error }]}>{errors.companyName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('jobTitle')} <Text style={{ color: colors.error }}>*</Text></Text>
              <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: errors.jobTitle ? colors.error : colors.border }]}>
                <TextInput style={[styles.fieldText, { color: colors.text }]} placeholder="Title of the job posting" placeholderTextColor={colors.textMuted} value={form.jobTitle} onChangeText={(t) => updateField('jobTitle', t)} />
              </View>
              {errors.jobTitle && <Text style={[styles.errorText, { color: colors.error }]}>{errors.jobTitle}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('description')} <Text style={{ color: colors.error }}>*</Text></Text>
              <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: errors.description ? colors.error : colors.border, minHeight: 120 }]}>
                <TextInput
                  style={[styles.fieldText, { color: colors.text }]}
                  placeholder="Describe the scam in detail... What happened? How were you approached? What red flags did you notice?"
                  placeholderTextColor={colors.textMuted}
                  value={form.description}
                  onChangeText={(t) => updateField('description', t)}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
              {errors.description && <Text style={[styles.errorText, { color: colors.error }]}>{errors.description}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('websiteUrl')}</Text>
              <View style={[styles.fieldInput, { backgroundColor: colors.inputBg, borderColor: errors.website ? colors.error : colors.border }]}>
                <TextInput style={[styles.fieldText, { color: colors.text }]} placeholder="https://" placeholderTextColor={colors.textMuted} value={form.website} onChangeText={(t) => updateField('website', t)} autoCapitalize="none" keyboardType="url" />
              </View>
              {errors.website && <Text style={[styles.errorText, { color: colors.error }]}>{errors.website}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('photoEvidence')}</Text>
              <View style={styles.photoRow}>
                <TouchableOpacity style={[styles.photoButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={takePhoto}>
                  <Ionicons name="camera-outline" size={24} color={colors.primary} />
                  <Text style={[styles.photoButtonText, { color: colors.primary }]}>{t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.photoButton, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={pickImage}>
                  <Ionicons name="images-outline" size={24} color={colors.primary} />
                  <Text style={[styles.photoButtonText, { color: colors.primary }]}>{t('gallery')}</Text>
                </TouchableOpacity>
              </View>
              {photo && (
                <View style={styles.photoPreview}>
                  <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.removePhoto} onPress={() => setPhoto(null)}>
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Button title={t('submitReport')} icon="send" loading={loading} onPress={handleSubmit} size="lg" fullWidth />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
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
  formCard: { padding: spacing.lg },
  inputGroup: { marginBottom: spacing.md },
  fieldLabel: { fontSize: typography.sm, fontWeight: '600', marginBottom: spacing.xs, marginLeft: 2 },
  fieldInput: { borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md },
  fieldText: { paddingVertical: 12, fontSize: typography.md },
  errorText: { fontSize: typography.xs, marginTop: 4, marginLeft: 2 },
  photoRow: { flexDirection: 'row', gap: spacing.sm },
  photoButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: borderRadius.md, borderWidth: 1, borderStyle: 'dashed' },
  photoButtonText: { fontSize: typography.md, fontWeight: '600', marginLeft: spacing.sm },
  photoPreview: { position: 'relative', marginTop: spacing.sm },
  previewImage: { width: '100%', height: 200, borderRadius: borderRadius.md },
  removePhoto: { position: 'absolute', top: 8, right: 8 },
});

export default NewReportScreen;
