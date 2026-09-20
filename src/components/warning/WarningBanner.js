import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography, shadows } from '../../theme';
import { getActiveWarnings, dismissWarning } from '../../services/warningService';

const severityConfig = {
  critical: { bg: '#dc2626', icon: 'warning', label: 'CRITICAL' },
  high: { bg: '#ea580c', icon: 'alert-circle', label: 'HIGH' },
  medium: { bg: '#d97706', icon: 'information-circle', label: 'ALERT' },
  low: { bg: '#2563eb', icon: 'shield-checkmark', label: 'INFO' }
};

const WarningBanner = () => {
  const { colors } = useTheme();
  const [warnings, setWarnings] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    loadWarnings();
    const interval = setInterval(loadWarnings, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (warnings.length > 1) {
      const timer = setInterval(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setCurrentIdx(prev => (prev + 1) % warnings.length);
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        });
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [warnings.length]);

  const loadWarnings = async () => {
    try {
      const data = await getActiveWarnings();
      setWarnings(data);
    } catch (err) {}
  };

  const dismiss = async (id) => {
    setWarnings(prev => prev.filter(w => w._id !== id));
    try { await dismissWarning(id); } catch (err) {}
  };

  if (warnings.length === 0) return null;

  const current = warnings[currentIdx % warnings.length];
  const sev = severityConfig[current.severity] || severityConfig.medium;

  return (
    <Animated.View style={[styles.banner, { backgroundColor: sev.bg, opacity: fadeAnim }]}>
      <Ionicons name={sev.icon} size={18} color="#fff" />
      <View style={styles.bannerContent}>
        <Text style={styles.bannerLabel}>{sev.label}</Text>
        <Text style={styles.bannerMessage} numberOfLines={2}>{current.message}</Text>
      </View>
      <TouchableOpacity onPress={() => dismiss(current._id)} style={styles.closeBtn}>
        <Ionicons name="close" size={16} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const ScanWarnings = ({ companyName, jobDescription }) => {
  const { colors } = useTheme();
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    checkWarnings();
  }, [companyName, jobDescription]);

  const checkWarnings = async () => {
    try {
      const allWarnings = await getActiveWarnings();
      const matches = allWarnings.filter(w => {
        if (w.companies?.length && companyName) {
          if (w.companies.some(c => companyName.toLowerCase().includes(c.toLowerCase()))) return true;
        }
        if (w.keywords?.length && jobDescription) {
          if (w.keywords.some(k => jobDescription.toLowerCase().includes(k.toLowerCase()))) return true;
        }
        return false;
      });
      setWarnings(matches);
    } catch (err) {}
  };

  if (warnings.length === 0) return null;

  const sevColors = { critical: '#fef2f2', high: '#fff7ed', medium: '#fefce8', low: '#eff6ff' };
  const sevText = { critical: '#991b1b', high: '#9a3412', medium: '#854d0e', low: '#1e40af' };

  return (
    <View>
      {warnings.map(w => {
        const bg = sevColors[w.severity] || sevColors.medium;
        const tc = sevText[w.severity] || sevText.medium;
        return (
          <View key={w._id} style={[styles.scanWarning, { backgroundColor: bg }]}>  
            <Ionicons name="warning" size={16} color={tc} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.scanWarningTitle, { color: tc }]}>{w.title}</Text>
              <Text style={[styles.scanWarningMsg, { color: tc }]}>{w.message}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm + 4, gap: 10 },
  bannerContent: { flex: 1 },
  bannerLabel: { color: '#fff', fontWeight: '700', fontSize: 10, letterSpacing: 0.5 },
  bannerMessage: { color: '#fff', fontSize: 12, opacity: 0.95 },
  closeBtn: { padding: 4, opacity: 0.8 },
  scanWarning: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: spacing.sm, borderRadius: borderRadius.md, marginBottom: spacing.sm },
  scanWarningTitle: { fontWeight: '700', fontSize: 12 },
  scanWarningMsg: { fontSize: 11, marginTop: 2 },
});

export { WarningBanner, ScanWarnings };
