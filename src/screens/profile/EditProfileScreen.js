import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { updateProfile } from '../../services/authService';
import { getInitials, validateEmail } from '../../utils/helpers';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const EditProfileScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!validateEmail(email.trim())) errs.email = 'Invalid email address';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const updated = await updateProfile({ name: name.trim(), email: email.trim() });
      const userData = updated.user || updated;
      await updateAuthProfile(userData);
      Toast.show({ type: 'success', text1: 'Profile Updated' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Update Failed', text2: err.message });
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Card style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
          <TouchableOpacity style={styles.changePhoto}>
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>Change Photo</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: errors.name ? colors.error : colors.border }]}>
              <Ionicons name="person-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput style={[styles.input, { color: colors.text }]} placeholder="Your name" placeholderTextColor={colors.textMuted} value={name} onChangeText={(t) => { setName(t); if (errors.name) setErrors({ ...errors, name: null }); }} autoCapitalize="words" />
            </View>
            {errors.name && <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: errors.email ? colors.error : colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput style={[styles.input, { color: colors.text }]} placeholder="Your email" placeholderTextColor={colors.textMuted} value={email} onChangeText={(t) => { setEmail(t); if (errors.email) setErrors({ ...errors, email: null }); }} keyboardType="email-address" autoCapitalize="none" />
            </View>
            {errors.email && <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text>}
          </View>

          <Button title="Save Changes" icon="checkmark" loading={loading} onPress={handleSave} size="lg" fullWidth />
        </Card>
      </ScrollView>
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
  avatarSection: { alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.md },
  avatar: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  avatarText: { color: '#FFFFFF', fontSize: typography.title, fontWeight: '700' },
  changePhoto: { padding: spacing.sm },
  changePhotoText: { fontSize: typography.md, fontWeight: '600' },
  formCard: { padding: spacing.lg },
  inputGroup: { marginBottom: spacing.md },
  label: { fontSize: typography.sm, fontWeight: '600', marginBottom: spacing.xs, marginLeft: 2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: spacing.md },
  inputIcon: { marginRight: spacing.sm },
  input: { flex: 1, paddingVertical: 14, fontSize: typography.base },
  errorText: { fontSize: typography.xs, marginTop: 4, marginLeft: 2 },
});

export default EditProfileScreen;
