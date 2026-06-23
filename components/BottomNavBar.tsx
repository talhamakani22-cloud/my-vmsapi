import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/styles/theme';

interface BottomNavBarProps {
  activeTab: 'dashboard' | 'forms' | 'settings';
  onTabChange: (tab: 'dashboard' | 'forms' | 'settings') => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' as const },
    { id: 'forms', label: 'Forms', icon: 'document-text' as const },
    { id: 'settings', label: 'Settings', icon: 'settings' as const },
  ];

  return (
    <LinearGradient
      colors={['rgba(15, 12, 41, 0.96)', 'rgba(48, 43, 99, 0.9)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => onTabChange(tab.id as 'dashboard' | 'forms' | 'settings')}
          activeOpacity={0.8}
        >
          {activeTab === tab.id ? (
            <LinearGradient
              colors={[COLORS.primaryPurple, COLORS.secondaryPurple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activeIconWrap}
            >
              <Ionicons name={tab.icon} size={18} color="#fff" />
            </LinearGradient>
          ) : (
            <Ionicons name={tab.icon} size={20} color="rgba(200, 200, 230, 0.55)" />
          )}
          <Text
            style={[
              styles.label,
              activeTab === tab.id && styles.activeLabel,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 12 : 6,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  activeTab: {
    opacity: 1,
  },
  activeIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryPurple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 10,
    color: 'rgba(200, 200, 230, 0.55)',
    marginTop: 3,
    fontWeight: '500',
  },
  activeLabel: {
    color: COLORS.secondaryPurple,
    fontWeight: '600',
  },
});

export default BottomNavBar;
