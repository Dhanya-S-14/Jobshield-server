import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { spacing, typography } from '../theme';
import HomeScreen from '../screens/home/HomeScreen';
import ScannerScreen from '../screens/scanner/ScannerScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChatBotScreen from '../screens/chatbot/ChatBotScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused, color }) => (
  <Ionicons name={focused ? name : `${name}-outline`} size={22} color={color} />
);

const ScannerTabIcon = ({ focused }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.scannerIconWrapper, { backgroundColor: colors.primary }]}>
      <Ionicons name="shield-checkmark" size={26} color="#FFFFFF" />
    </View>
  );
};

const TabNavigator = () => {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: typography.xs,
          fontWeight: '600',
          marginBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('home') || 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          tabBarLabel: t('newScan') || 'Scan',
          tabBarIcon: ({ focused }) => <ScannerTabIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: t('scanHistory') || 'History',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="time" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: t('reports') || 'Reports',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="flag" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatBot"
        component={ChatBotScreen}
        options={{
          tabBarLabel: t('aiChat') || 'AI Chat',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="chatbubble-ellipses" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile') || 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="person" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  scannerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default TabNavigator;
