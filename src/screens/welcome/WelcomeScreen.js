import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const features = [
    { icon: 'scan-outline', title: 'Scan Job Postings', desc: 'Paste or screenshot any job posting to check if it is a scam' },
    { icon: 'shield-checkmark-outline', title: 'AI Detection', desc: 'Advanced AI engine analyzes 50+ scam patterns instantly' },
    { icon: 'people-outline', title: 'Community Reports', desc: 'Join thousands of users reporting scam jobs' },
    { icon: 'analytics-outline', title: 'Risk Score', desc: 'Get a clear 0-100 risk score with detailed explanation' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={[styles.logoLarge, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="shield-checkmark" size={64} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>JobShield</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Detect job scams before you apply
          </Text>
        </View>

        <View style={styles.featuresSection}>
          {features.map((f, i) => (
            <View key={i} style={[styles.featureCard, { backgroundColor: colors.card }, shadows.sm]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={f.icon} size={24} color={colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{f.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('TrialScan')}
          >
            <Ionicons name="scan-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Try Free Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: colors.primary }]}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Login / Register</Text>
          </TouchableOpacity>

          <Text style={[styles.footer, { color: colors.textMuted }]}>
            One free scan available. Sign up for unlimited access.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xxl },
  heroSection: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
  logoLarge: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
  appName: { fontSize: typography.title, fontWeight: '800', letterSpacing: -1, marginBottom: spacing.xs },
  tagline: { fontSize: typography.base, textAlign: 'center', lineHeight: 24 },
  featuresSection: { marginBottom: spacing.xl },
  featureCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.sm },
  featureIcon: { width: 48, height: 48, borderRadius: borderRadius.md, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  featureText: { flex: 1 },
  featureTitle: { fontSize: typography.base, fontWeight: '700', marginBottom: 2 },
  featureDesc: { fontSize: typography.sm, lineHeight: 18 },
  bottomSection: { marginTop: spacing.md },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: borderRadius.md, marginBottom: spacing.md },
  primaryBtnText: { color: '#FFFFFF', fontSize: typography.base, fontWeight: '700' },
  secondaryBtn: { paddingVertical: 16, borderRadius: borderRadius.md, borderWidth: 2, alignItems: 'center', marginBottom: spacing.lg },
  secondaryBtnText: { fontSize: typography.base, fontWeight: '700' },
  footer: { fontSize: typography.sm, textAlign: 'center' },
});

export default WelcomeScreen;
