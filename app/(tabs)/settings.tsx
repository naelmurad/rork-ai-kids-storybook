import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Crown
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSettings, SupportedLanguage } from '@/hooks/app-settings';

import PremiumUpgradeScreen from '@/components/PremiumUpgradeScreen';


interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

export default function SettingsScreen() {
  const { 
    settings, 
    usageLimits,
    upgradeToPremium,
    updateSettings,
    currentLanguage,
    t
  } = useAppSettings();
  const [showPremiumUpgrade, setShowPremiumUpgrade] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLanguageChange = async (language: SupportedLanguage) => {
    await updateSettings({ language });
  };





  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <Text style={[styles.headerTitle, (currentLanguage === 'ar' || currentLanguage === 'zh') && styles.rtlText]}>{t('settings')}</Text>
        <Text style={[styles.headerSubtitle, (currentLanguage === 'ar' || currentLanguage === 'zh') && styles.rtlText]}>
          {currentLanguage === 'ar' ? 'إدارة حسابك وإعداداتك' : 'Manage your account and settings'}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, (currentLanguage === 'ar' || currentLanguage === 'zh') && styles.rtlText]}>{t('subscription')}</Text>
          <View style={[styles.card, settings.isPremium && styles.premiumCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                {settings.isPremium && <Crown size={20} color="#FFD700" />}
                <Text style={styles.cardTitle}>
                  {settings.isPremium ? (currentLanguage === 'ar' ? 'بريميوم' : 'Premium') : (currentLanguage === 'ar' ? 'الخطة المجانية' : 'Free Plan')}
                </Text>
              </View>
              {!settings.isPremium && (
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => setShowPremiumUpgrade(true)}
                >
                  <Crown size={16} color="#FFD700" />
                  <Text style={styles.upgradeButtonText}>{t('upgrade')}</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.cardDescription}>
              {settings.isPremium 
                ? (currentLanguage === 'ar' ? 'قصص غير محدودة، صفحات ممتدة، بدون إعلانات، تصدير PDF' : 'Unlimited stories, extended pages, no ads, PDF export')
                : (currentLanguage === 'ar' ? `${usageLimits.weeklyStories} قصة أسبوعياً، ${usageLimits.maxPages} صفحات كحد أقصى، مع إعلانات` : `${usageLimits.weeklyStories} stories per week, ${usageLimits.maxPages} pages max, with ads`)
              }
            </Text>
          </View>
        </View>



        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, (currentLanguage === 'ar' || currentLanguage === 'zh') && styles.rtlText]}>{t('language')}</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.languageScrollContainer,
              currentLanguage === 'ar' && styles.rtlScrollContainer
            ]}
            style={currentLanguage === 'ar' && styles.rtlScrollView}
          >
            <View style={[
              styles.languageGrid,
              currentLanguage === 'ar' && styles.rtlLanguageGrid
            ]}>
              {LANGUAGES.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    currentLanguage === language.code && styles.languageOptionSelected,
                  ]}
                  onPress={() => handleLanguageChange(language.code)}
                >
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <Text style={[
                    styles.languageName,
                    currentLanguage === language.code && styles.languageNameSelected,
                  ]}>
                    {language.nativeName}
                  </Text>
                  {currentLanguage === language.code && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, (currentLanguage === 'ar' || currentLanguage === 'zh') && styles.rtlText]}>{t('statistics')}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{settings.currentStreak}</Text>
              <Text style={styles.statLabel}>{t('currentStreak')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{settings.longestStreak}</Text>
              <Text style={styles.statLabel}>{t('longestStreak')}</Text>
            </View>

          </View>
        </View>
      </ScrollView>


      
      <PremiumUpgradeScreen
        visible={showPremiumUpgrade}
        onClose={() => setShowPremiumUpgrade(false)}
        onUpgrade={async () => {
          await upgradeToPremium();
          setShowPremiumUpgrade(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E8E8E8',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  premiumCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },

  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  languageScrollContainer: {
    paddingHorizontal: 20,
  },
  rtlScrollContainer: {
    flexDirection: 'row-reverse',
  },
  rtlScrollView: {
    transform: [{ scaleX: -1 }],
  },
  languageGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  rtlLanguageGrid: {
    transform: [{ scaleX: -1 }],
  },
  languageOption: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  languageOptionSelected: {
    backgroundColor: '#E8F4FD',
    borderColor: '#4A90E2',
  },
  languageFlag: {
    fontSize: 20,
    marginBottom: 4,
  },
  languageName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  languageNameSelected: {
    color: '#4A90E2',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});