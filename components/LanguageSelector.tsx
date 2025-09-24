import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation, SupportedLanguage } from '@/hooks/app-settings';

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onLanguageSelect: (language: SupportedLanguage) => void;
}

const languages = [
  { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  { code: 'it' as const, name: 'Italiano', flag: '🇮🇹' },
  { code: 'de' as const, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh' as const, name: '中文', flag: '🇨🇳' },
  { code: 'ar' as const, name: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSelector({ selectedLanguage, onLanguageSelect }: LanguageSelectorProps) {
  const { t } = useTranslation(selectedLanguage);
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('language')}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContainer,
          selectedLanguage === 'ar' && styles.rtlScrollContainer
        ]}
        style={selectedLanguage === 'ar' && styles.rtlScrollView}
      >
        <View style={[
          styles.buttonContainer,
          selectedLanguage === 'ar' && styles.rtlButtonContainer
        ]}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageButton,
                selectedLanguage === lang.code && styles.selectedLanguage
              ]}
              onPress={() => onLanguageSelect(lang.code)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.languageText,
                selectedLanguage === lang.code && styles.selectedLanguageText,
                selectedLanguage === 'ar' && styles.rtlButtonText
              ]}>
                {lang.flag} {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  scrollContainer: {
    paddingRight: 20,
  },
  rtlScrollContainer: {
    flexDirection: 'row-reverse',
    paddingRight: 0,
    paddingLeft: 20,
  },
  rtlScrollView: {
    transform: [{ scaleX: -1 }],
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  rtlButtonContainer: {
    transform: [{ scaleX: -1 }],
  },
  languageButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  selectedLanguage: {
    backgroundColor: '#E8F4FD',
    borderColor: '#4A90E2',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  selectedLanguageText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  rtlButtonText: {
    transform: [{ scaleX: -1 }],
  },
});