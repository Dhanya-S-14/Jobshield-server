import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../theme';
import Card from '../components/common/Card';

const SocialLink = ({ icon, label, url, colors }) => (
  <TouchableOpacity style={[styles.socialLink, { backgroundColor: colors.inputBg }]} onPress={() => Linking.openURL(url)}>
    <Ionicons name={icon} size={22} color={colors.primary} />
    <Text style={[styles.socialLabel, { color: colors.text }]}>{label}</Text>
  </TouchableOpacity>
);

const AboutScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.borderLight, shadowColor: colors.black }, shadows.sm]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.inputBg }]}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('about')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.logoCard}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primaryLight + '20' }]}>
            <Ionicons name="shield-checkmark" size={64} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>{t('appName')}</Text>
          <Text style={[styles.version, { color: colors.textMuted }]}>{t('version')}</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            {t('tagline')}
          </Text>
        </Card>

        <Card style={styles.descriptionCard}>
          <Text style={[styles.descriptionTitle, { color: colors.text }]}>{t('ourMission')}</Text>
          <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
            {t('missionDescription')}
          </Text>
          <Text style={[styles.descriptionText, { color: colors.textSecondary, marginTop: spacing.md }]}>
            {t('builtWith')}
          </Text>
        </Card>

        <Card style={styles.devCard}>
          <Text style={[styles.devTitle, { color: colors.text }]}>{t('developer')}</Text>
          <Text style={[styles.devName, { color: colors.text }]}>{t('jobShieldTeam')}</Text>
          <Text style={[styles.devEmail, { color: colors.primary }]}>support@jobshield.app</Text>
        </Card>

        <Card style={styles.socialCard}>
          <Text style={[styles.socialTitle, { color: colors.text }]}>{t('connectWithUs')}</Text>
          <View style={styles.socialRow}>
            <SocialLink icon="logo-github" label="GitHub" url="https://github.com/jobshield" colors={colors} />
            <SocialLink icon="logo-twitter" label="Twitter" url="https://twitter.com/jobshield" colors={colors} />
          </View>
          <View style={[styles.socialRow, { marginTop: spacing.sm }]}>
            <SocialLink icon="logo-linkedin" label="LinkedIn" url="https://linkedin.com/company/jobshield" colors={colors} />
            <SocialLink icon="globe-outline" label="Website" url="https://jobshield.app" colors={colors} />
          </View>
        </Card>

        <Text style={[styles.footer, { color: colors.textMuted }]}>
          © 2024 JobShield. {t('allRightsReserved').replace('© 2024 JobShield. ', '')}
        </Text>
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
  logoCard: { alignItems: 'center', paddingVertical: spacing.xl, marginBottom: spacing.md },
  logoContainer: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  appName: { fontSize: typography.title, fontWeight: '800', letterSpacing: -0.5 },
  version: { fontSize: typography.sm, marginTop: spacing.xs },
  tagline: { fontSize: typography.md, marginTop: spacing.sm, textAlign: 'center' },
  descriptionCard: { marginBottom: spacing.md, padding: spacing.lg },
  descriptionTitle: { fontSize: typography.xl, fontWeight: '700', marginBottom: spacing.sm },
  descriptionText: { fontSize: typography.md, lineHeight: 22 },
  devCard: { marginBottom: spacing.md, padding: spacing.lg },
  devTitle: { fontSize: typography.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  devName: { fontSize: typography.lg, fontWeight: '700' },
  devEmail: { fontSize: typography.md, marginTop: spacing.xs },
  socialCard: { marginBottom: spacing.md, padding: spacing.lg },
  socialTitle: { fontSize: typography.xl, fontWeight: '700', marginBottom: spacing.md },
  socialRow: { flexDirection: 'row', gap: spacing.sm },
  socialLink: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: borderRadius.md },
  socialLabel: { fontSize: typography.md, fontWeight: '600', marginLeft: spacing.sm },
  footer: { fontSize: typography.sm, textAlign: 'center', marginTop: spacing.lg },
});

export default AboutScreen;
