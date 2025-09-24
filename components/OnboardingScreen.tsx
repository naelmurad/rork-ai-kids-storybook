import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  BookOpen, 
  Sparkles, 
  Crown, 
  Download,
  ChevronRight,
  Check,
  Globe
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSettings, SupportedLanguage } from '@/hooks/app-settings';

interface OnboardingScreenProps {
  onComplete: () => void;
}

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



const onboardingSteps = [
  {
    icon: Globe,
    title: 'Choose Your Language',
    subtitle: 'Select your preferred language',
    description: 'Choose the language for the app interface and stories. You can change this later in settings.',
    color: '#4ECDC4',
    isLanguageSelection: true,
  },
  {
    icon: BookOpen,
    title: 'Welcome to AI Kids Storybook',
    subtitle: 'Create magical personalized stories for your children',
    description: 'Generate beautiful illustrated bedtime stories tailored to your child\'s name, age, and favorite themes.',
    color: '#667eea',
  },
  {
    icon: Sparkles,
    title: 'Free vs Premium',
    subtitle: 'Choose what works best for your family',
    description: 'Free: 2 stories per week with 5 pages\nPremium: Unlimited stories with up to 12 pages, no ads, and PDF export.',
    color: '#FF6B9D',
  },
  {
    icon: Download,
    title: 'Save & Share',
    subtitle: 'Keep the magic alive',
    description: 'Save stories to your library and export them as PDFs to share with family and friends.',
    color: '#45B7D1',
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const { updateSettings, t } = useAppSettings();
  const insets = useSafeAreaInsets();

  const goToNextStep = async () => {
    if (currentStep === 0) {
      // Save language selection
      await updateSettings({ 
        language: selectedLanguage,
        hasSelectedLanguage: true 
      });
    }
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = onboardingSteps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[currentStepData.color, '#764ba2']}
        style={[styles.gradient, { paddingTop: insets.top + 20 }]}
      >
        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {onboardingSteps.map((step, index) => (
            <View
              key={`${step.title}-${index}`}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <IconComponent size={64} color="#FFF" />
            </View>
          </View>

          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>

          {currentStep === 0 && currentStepData.isLanguageSelection && (
            <View style={styles.languageContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                  styles.languageScrollContainer,
                  selectedLanguage === 'ar' && styles.rtlScrollContainer
                ]}
                style={selectedLanguage === 'ar' && styles.rtlScrollView}
              >
                <View style={[
                  styles.languageGrid,
                  selectedLanguage === 'ar' && styles.rtlLanguageGrid
                ]}>
                  {LANGUAGES.map((language) => (
                    <TouchableOpacity
                      key={language.code}
                      style={[
                        styles.languageOption,
                        selectedLanguage === language.code && styles.languageOptionSelected,
                      ]}
                      onPress={() => setSelectedLanguage(language.code)}
                    >
                      <Text style={styles.languageFlag}>{language.flag}</Text>
                      <Text style={[
                        styles.languageName,
                        selectedLanguage === language.code && styles.languageNameSelected,
                      ]}>
                        {language.nativeName}
                      </Text>
                      {selectedLanguage === language.code && (
                        <View style={styles.selectedIndicator} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.pricingContainer}>
              <View style={styles.pricingCard}>
                <Text style={styles.pricingTitle}>Free</Text>
                <Text style={styles.pricingPrice}>$0</Text>
                <View style={styles.pricingFeatures}>
                  <View style={styles.pricingFeature}>
                    <Check size={16} color="#4CAF50" />
                    <Text style={styles.pricingFeatureText}>2 stories per week</Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Check size={16} color="#4CAF50" />
                    <Text style={styles.pricingFeatureText}>5 pages per story</Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Check size={16} color="#4CAF50" />
                    <Text style={styles.pricingFeatureText}>Basic themes</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.pricingCard, styles.premiumCard]}>
                <View style={styles.premiumBadge}>
                  <Crown size={16} color="#FFD700" />
                  <Text style={styles.premiumBadgeText}>Premium</Text>
                </View>
                <Text style={styles.pricingTitle}>Premium</Text>
                <Text style={styles.pricingPrice}>$1.50/week</Text>
                <View style={styles.pricingFeatures}>
                  <View style={styles.pricingFeature}>
                    <Check size={16} color="#4CAF50" />
                    <Text style={styles.pricingFeatureText}>Unlimited stories</Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Check size={16} color="#4CAF50" />
                    <Text style={styles.pricingFeatureText}>Up to 12 pages</Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Check size={16} color="#4CAF50" />
                    <Text style={styles.pricingFeatureText}>No ads</Text>
                  </View>
                  <View style={styles.pricingFeature}>
                    <Check size={16} color="#4CAF50" />
                    <Text style={styles.pricingFeatureText}>PDF export</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={goToPreviousStep}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.spacer} />
          
          <TouchableOpacity
            style={styles.nextButton}
            onPress={goToNextStep}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFF', '#F0F0F0']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <ChevronRight size={20} color={currentStepData.color} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#E8E8E8',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#D0D0D0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  pricingContainer: {
    width: '100%',
    gap: 16,
  },
  pricingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  premiumCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 16,
  },
  pricingFeatures: {
    alignSelf: 'stretch',
    gap: 8,
  },
  pricingFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pricingFeatureText: {
    fontSize: 14,
    color: '#666',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  languageContainer: {
    width: '100%',
    marginBottom: 20,
  },
  languageScrollContainer: {
    paddingHorizontal: 10,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    backgroundColor: '#FFF',
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
});