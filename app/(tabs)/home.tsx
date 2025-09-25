import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, BookOpen, Sparkles, Crown, Flame, Star, Upload } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as ImagePicker from 'expo-image-picker';
import { useStories } from '@/hooks/story-store';
import { useAppSettings, SupportedLanguage } from '@/hooks/app-settings';
import { Story, StoryGenerationRequest } from '@/types/story';
import StoryCard from '@/components/StoryCard';
import StoryReader from '@/components/StoryReader';
import ThemeSelector from '@/components/ThemeSelector';
import LanguageSelector from '@/components/LanguageSelector';
import PremiumUpgradeScreen from '@/components/PremiumUpgradeScreen';
import StoryBanner from '@/components/StoryBanner';
import BannerAd from '@/components/BannerAd';
import { useAds } from '@/hooks/ad-store';

export default function HomeScreen() {
  const { stories, isLoading, isGenerating, generationProgress, generateStory } = useStories();
  const { 
    settings, 
    usageLimits, 
    canCreateStory, 
    selectedProfile, 
    incrementDailyUsage, 
    upgradeToPremium,
    updateSettings,
    lastSelectedGender,
    t,
    currentLanguage 
  } = useAppSettings();
  const { loadInterstitialAd, showInterstitialAd, shouldShowAd } = useAds();
  const insets = useSafeAreaInsets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showError, setShowError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});
  const [showPremiumUpgrade, setShowPremiumUpgrade] = useState(false);
  
  // Form state
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('adventure');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(currentLanguage);
  const [pageCount, setPageCount] = useState<number>(5);
  const [storyMode, setStoryMode] = useState<'text' | 'illustrated'>('illustrated');
  const [selectedGender, setSelectedGender] = useState<'boy' | 'girl'>(lastSelectedGender);
  
  // Update selected gender when lastSelectedGender changes
  React.useEffect(() => {
    setSelectedGender(lastSelectedGender);
  }, [lastSelectedGender]);
  

  
  // Sync selected language with current app language
  React.useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);
  const [customTheme, setCustomTheme] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const convertToCartoonAvatar = async (imageBase64: string): Promise<string> => {
    try {
      const response = await fetch('https://toolkit.rork.com/images/edit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Convert this photo into a cute cartoon avatar style, suitable for children\'s storybooks. Make it colorful, friendly, and animated with big expressive eyes. Keep the main features but make it look like a cartoon character.',
          images: [{ type: 'image', image: imageBase64 }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert image');
      }

      const result = await response.json();
      return result.image.base64Data;
    } catch (error) {
      console.error('Error converting to cartoon:', error);
      throw error;
    }
  };

  const handlePhotoUpload = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need camera roll permissions to upload photos.'
        );
        return;
      }
    }

    try {
      setUploadingPhoto(true);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const imageBase64 = result.assets[0].base64;
        if (!imageBase64) {
          throw new Error('Failed to get image data');
        }

        // Convert to cartoon avatar
        const cartoonBase64 = await convertToCartoonAvatar(imageBase64);
        const cartoonUri = `data:image/png;base64,${cartoonBase64}`;
        setAvatarUri(cartoonUri);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload and convert photo. Please try again.'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Camera is not available on web. Please use photo upload instead.');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need camera permissions to take photos.'
      );
      return;
    }

    try {
      setUploadingPhoto(true);
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const imageBase64 = result.assets[0].base64;
        if (!imageBase64) {
          throw new Error('Failed to get image data');
        }

        // Convert to cartoon avatar
        const cartoonBase64 = await convertToCartoonAvatar(imageBase64);
        const cartoonUri = `data:image/png;base64,${cartoonBase64}`;
        setAvatarUri(cartoonUri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert(
        'Camera Failed',
        'Failed to take and convert photo. Please try again.'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      t('addAvatar'),
      'Choose how you want to add your child\'s photo',
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('takePhoto'), onPress: handleTakePhoto },
        { text: t('chooseFromLibrary'), onPress: handlePhotoUpload },
      ]
    );
  };

  // Helper function to transliterate Arabic names to English
  const transliterateArabicName = (name: string): string => {
    const arabicToEnglish: { [key: string]: string } = {
      'أ': 'A', 'ا': 'A', 'إ': 'I', 'آ': 'A',
      'ب': 'B', 'ت': 'T', 'ث': 'Th', 'ج': 'J',
      'ح': 'H', 'خ': 'Kh', 'د': 'D', 'ذ': 'Th',
      'ر': 'R', 'ز': 'Z', 'س': 'S', 'ش': 'Sh',
      'ص': 'S', 'ض': 'D', 'ط': 'T', 'ظ': 'Z',
      'ع': 'A', 'غ': 'Gh', 'ف': 'F', 'ق': 'Q',
      'ك': 'K', 'ل': 'L', 'م': 'M', 'ن': 'N',
      'ه': 'H', 'و': 'W', 'ي': 'Y', 'ى': 'A',
      'ة': 'A', 'ء': '', 'ئ': 'Y', 'ؤ': 'W'
    };
    
    return name.split('').map(char => arabicToEnglish[char] || char).join('');
  };

  const validateForm = () => {
    const errors: {[key: string]: boolean} = {};
    let hasErrors = false;

    // Validate child name
    if (!childName.trim()) {
      errors.childName = true;
      hasErrors = true;
    }

    // Validate child age
    const normalizedAge = childAge.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    const age = parseInt(normalizedAge);
    if (!age || age < 1 || age > 12) {
      errors.childAge = true;
      hasErrors = true;
    }

    // Validate custom theme if selected
    if (selectedTheme === 'custom' && !customTheme.trim()) {
      errors.customTheme = true;
      hasErrors = true;
    }

    setValidationErrors(errors);
    return !hasErrors;
  };

  // Test function to check API connectivity
  const testAPIConnection = async () => {
    try {
      console.log('Testing API connection...');
      
      // Simple connectivity test with shorter timeout
      const testTimeout = 5000; // 5 seconds
      const testApiCall = fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'Test'
            }
          ]
        })
      });
      
      const testTimeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('API test timed out'));
        }, testTimeout);
      });
      
      const response = await Promise.race([testApiCall, testTimeoutPromise]);
      
      console.log('API Response status:', response.status);
      
      // Accept any response that's not a network error
      if (response.status >= 200 && response.status < 500) {
        console.log('API connection test passed');
        return true;
      } else {
        console.error('API returned error status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('API Connection test failed:', error);
      return false;
    }
  };

  const handleCreateStory = async () => {
    console.log('=== STORY CREATION STARTED ===');
    console.log('Current form state:', {
      childName,
      childAge,
      selectedTheme,
      selectedLanguage,
      pageCount,
      storyMode,
      selectedGender,
      avatarUri: avatarUri ? 'provided' : 'not provided'
    });
    
    // Add debugging for the Rork Toolkit SDK
    try {
      const { generateText } = await import('@rork/toolkit-sdk');
      console.log('Rork Toolkit SDK imported successfully:', typeof generateText);
    } catch (sdkError) {
      console.error('Failed to import Rork Toolkit SDK:', sdkError);
      setShowError('SDK import failed: ' + (sdkError instanceof Error ? sdkError.message : String(sdkError)));
      return;
    }
    
    // Test API connection first (but don't block if it fails)
    try {
      const apiWorking = await testAPIConnection();
      if (!apiWorking) {
        console.warn('API connection test failed, but continuing with story generation...');
      } else {
        console.log('API connection test passed');
      }
    } catch (error) {
      console.warn('API test failed, but continuing:', error);
    }
    
    try {
      // Check usage limits
      if (!canCreateStory) {
        console.log('Cannot create story - usage limit reached');
        setShowPremiumUpgrade(true);
        return;
      }

      // Validate form
      if (!validateForm()) {
        console.log('Form validation failed');
        setShowError(t('pleaseFillRequiredFields'));
        return;
      }

      console.log('Form validation passed, proceeding with story creation...');
      
      // Clear any previous errors
      setShowError(null);

      // Convert Arabic numerals to English numerals if needed
      const normalizedAge = childAge.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
      const age = parseInt(normalizedAge);

      // Handle name conversion based on selected language
      let finalChildName = childName.trim();
      
      // If the name is in Arabic and story language is not Arabic, transliterate it
      if (/[\u0600-\u06FF]/.test(finalChildName) && selectedLanguage !== 'ar') {
        finalChildName = transliterateArabicName(finalChildName);
        console.log(`Transliterated Arabic name from ${childName} to ${finalChildName} for ${selectedLanguage} story`);
      }
      
      console.log(`Creating story in ${selectedLanguage} language with name: ${finalChildName}`);

      const finalTheme = selectedTheme === 'custom' ? customTheme : selectedTheme;
      const request: StoryGenerationRequest = {
        childName: finalChildName,
        childAge: age,
        theme: finalTheme,
        language: selectedLanguage,
        profileId: selectedProfile?.id,
        pageCount,
        gender: selectedGender,
      };

      console.log('Story request prepared:', request);

      // Save the selected gender preference
      console.log('Saving gender preference...');
      await updateSettings({ lastSelectedGender: selectedGender });
      
      let finalAvatarUri = avatarUri || selectedProfile?.avatar;
      
      // Use static avatar if no photo provided and illustrations are requested
      if (storyMode === 'illustrated' && !finalAvatarUri) {
        // Use static avatar based on selected gender
        const staticAvatars = {
          boy: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
          girl: 'https://images.unsplash.com/photo-1494790108755-2616c9c0e8e3?w=400&h=400&fit=crop&crop=face&auto=format&q=80'
        };
        finalAvatarUri = staticAvatars[selectedGender];
        console.log(`Using static ${selectedGender} avatar for illustrated story. Selected gender: ${selectedGender}`);
      }
      
      console.log('Starting story generation...');
      console.log('Final request object:', {
        ...request,
        includeIllustrations: storyMode === 'illustrated'
      });
      console.log('Final avatar URI:', finalAvatarUri ? 'provided' : 'not provided');
      
      // Validate final request before sending
      if (!request.childName || !request.childName.trim()) {
        throw new Error('Child name is required');
      }
      if (!request.childAge || request.childAge < 1 || request.childAge > 12) {
        throw new Error('Valid child age is required (1-12)');
      }
      if (!request.theme || !request.theme.trim()) {
        throw new Error('Story theme is required');
      }
      
      // Add timeout protection for the entire story generation process
      const storyGenerationTimeout = 180000; // 3 minutes timeout for better reliability
      const storyGenerationPromise = generateStory({
        ...request,
        includeIllustrations: storyMode === 'illustrated'
      }, finalAvatarUri);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Story generation timed out. Please try again with fewer pages or text-only mode.'));
        }, storyGenerationTimeout);
      });
      
      // Race between story generation and timeout
      console.log('Calling generateStory function with final request:', {
        ...request,
        includeIllustrations: storyMode === 'illustrated'
      });
      console.log('Avatar URI being passed:', finalAvatarUri ? 'provided' : 'not provided');
      
      const story = await Promise.race([storyGenerationPromise, timeoutPromise]);
      
      console.log('Story generation completed successfully!');
      console.log('Received story details:', {
        id: story.id,
        title: story.title,
        pageCount: story.pages.length,
        hasIllustrations: story.includeIllustrations,
        pagesWithImages: story.pages.filter(p => p.imageBase64 && p.imageBase64.length > 10).length
      });
      
      console.log('Story generation completed successfully!');
      
      // Only after story is completely generated, increment usage and show it
      console.log('Incrementing daily usage...');
      await incrementDailyUsage();
      
      // Show interstitial ad occasionally after story creation
      if (shouldShowAd(3)) {
        console.log('Loading and showing interstitial ad...');
        try {
          // Add timeout for ad loading to prevent hanging
          const adPromise = Promise.all([loadInterstitialAd(), showInterstitialAd()]);
          const adTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Ad timeout')), 10000);
          });
          await Promise.race([adPromise, adTimeout]);
        } catch (adError) {
          console.log('Ad failed to load/show, continuing...', adError);
        }
      }
      
      console.log('Closing modal and showing story...');
      
      // Close modal and show story after generation is complete
      setShowCreateModal(false);
      setSelectedStory(story);
      
      // Reset form
      setChildName('');
      setChildAge('');
      setSelectedTheme('adventure');
      setSelectedLanguage(currentLanguage);
      setCustomTheme('');
      setAvatarUri(null);
      setPageCount(5);
      setStoryMode('illustrated');
      setSelectedGender('boy');
      setValidationErrors({});
      
      console.log('=== STORY CREATION COMPLETED SUCCESSFULLY ===');
      
    } catch (error) {
      console.error('=== STORY CREATION FAILED ===');
      console.error('Error occurred at:', new Date().toISOString());
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('Error type:', typeof error);
      console.error('Form state when error occurred:', {
        childName,
        childAge,
        selectedTheme,
        selectedLanguage,
        pageCount,
        storyMode,
        selectedGender,
        avatarUri: avatarUri ? 'provided' : 'not provided'
      });
      
      // Try to get more error details
      if (error && typeof error === 'object') {
        console.error('Error object keys:', Object.keys(error));
        console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      }
      
      // Determine user-friendly error message
      let errorMessage = t('failedToGenerate');
      if (error instanceof Error) {
        console.log('Processing error message:', error.message);
        if (error.message.includes('timeout')) {
          errorMessage = 'Story generation timed out. Please try again with fewer pages or text-only mode.';
        } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('API') || error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
          errorMessage = 'Service temporarily unavailable. Please try again in a moment.';
        } else if (error.message.includes('Failed to generate story')) {
          errorMessage = 'Story generation service error. Please try again.';
        } else {
          // Show the actual error message for debugging
          errorMessage = `Error: ${error.message}`;
        }
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      console.log('Final error message to show user:', errorMessage);
      
      // Make sure we show the error to the user
      console.log('Setting error state to show modal:', errorMessage);
      setShowError(errorMessage);
      
      // Force update the UI state
      console.log('Current UI state after error:', {
        showError: !!errorMessage,
        isGenerating,
        showCreateModal
      });
      
      // Don't close the modal on error so user can try again
      console.log('Keeping modal open due to error');
      console.log('Final error state:', {
        showError: !!showError,
        isGenerating,
        errorMessage
      });
    }
  };

  const renderErrorModal = () => (
    <Modal
      visible={!!showError}
      transparent
      animationType="fade"
    >
      <View style={styles.errorOverlay}>
        <View style={styles.errorModal}>
          <Text style={styles.errorTitle}>{t('oops')}</Text>
          <Text style={styles.errorMessage}>{showError}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => setShowError(null)}
          >
            <Text style={styles.errorButtonText}>{t('ok')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.modalGradient}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('createNewStoryTitle')}</Text>
            <TouchableOpacity
              onPress={() => {
                if (!isGenerating) {
                  setShowCreateModal(false);
                  setAvatarUri(null);
                  setCustomTheme('');
                  setPageCount(5);
                  setStoryMode('illustrated');
                  setSelectedGender('boy');
                  setValidationErrors({});
                }
              }}
              style={[styles.modalCloseButton, isGenerating && styles.modalCloseButtonDisabled]}
              disabled={isGenerating}
            >
              <Text style={[styles.modalCloseText, isGenerating && styles.modalCloseTextDisabled]}>
                {isGenerating ? t('generating') : t('cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* Story Mode Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('storyType')}</Text>
              <View style={styles.storyModeContainer}>
                <TouchableOpacity
                  style={[
                    styles.storyModeButton,
                    storyMode === 'text' && styles.storyModeButtonSelected
                  ]}
                  onPress={() => setStoryMode('text')}
                >
                  <Text style={[
                    styles.storyModeText,
                    storyMode === 'text' && styles.storyModeTextSelected
                  ]}>
                    {t('textOnly')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.storyModeButton,
                    storyMode === 'illustrated' && styles.storyModeButtonSelected
                  ]}
                  onPress={() => setStoryMode('illustrated')}
                >
                  <Text style={[
                    styles.storyModeText,
                    storyMode === 'illustrated' && styles.storyModeTextSelected
                  ]}>
                    {t('withIllustrations')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Gender Selection - Always show for both modes */}
            <View style={styles.inputGroup}>
              <Text style={[styles.genderLabel, currentLanguage === 'ar' && styles.rtlText]}>{t('selectGender')}</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    selectedGender === 'boy' && styles.genderButtonSelected
                  ]}
                  onPress={() => {
                    console.log('Selected gender: boy');
                    setSelectedGender('boy');
                  }}
                >
                  <Text style={[
                    styles.genderButtonText,
                    selectedGender === 'boy' && styles.genderButtonTextSelected,
                    currentLanguage === 'ar' && styles.rtlText
                  ]}>
                    {t('boy')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderButton,
                    selectedGender === 'girl' && styles.genderButtonSelected
                  ]}
                  onPress={() => {
                    console.log('Selected gender: girl');
                    setSelectedGender('girl');
                  }}
                >
                  <Text style={[
                    styles.genderButtonText,
                    selectedGender === 'girl' && styles.genderButtonTextSelected,
                    currentLanguage === 'ar' && styles.rtlText
                  ]}>
                    {t('girl')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Avatar Section - Only show if illustrated mode */}
            {storyMode === 'illustrated' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('addAvatar')} ({t('optional')})</Text>
                
                <View style={styles.avatarSection}>
                  <View style={styles.avatarContainer}>
                    {avatarUri && avatarUri.trim() !== '' && avatarUri !== 'undefined' && avatarUri !== 'null' ? (
                      <Image 
                        source={{ uri: avatarUri.startsWith('data:') ? avatarUri : `data:image/png;base64,${avatarUri}` }} 
                        style={styles.avatar}
                        onError={(error) => {
                          console.log('Avatar image load error:', error.nativeEvent?.error);
                          setAvatarUri(null);
                        }}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarPlaceholderText}>
                          {selectedGender === 'boy' ? '👦' : '👧'}
                        </Text>
                        <Text style={styles.avatarPlaceholderLabel}>
                          {t(selectedGender)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.avatarOptions}>
                    <TouchableOpacity 
                      style={styles.uploadButton}
                      onPress={showPhotoOptions}
                      disabled={uploadingPhoto}
                    >
                      {uploadingPhoto ? (
                        <Text style={styles.uploadButtonText}>{t('converting')}</Text>
                      ) : (
                        <>
                          <Upload size={16} color="#667eea" />
                          <Text style={styles.uploadButtonText}>{avatarUri ? t('changePhoto') : t('uploadPhoto')}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    {avatarUri && (
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => setAvatarUri(null)}
                      >
                        <Text style={styles.removePhotoText}>Use Default</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, validationErrors.childName && styles.inputLabelError]}>
                {t('childName')} <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  validationErrors.childName && styles.textInputError
                ]}
                value={childName}
                onChangeText={(text) => {
                  setChildName(text);
                  if (validationErrors.childName && text.trim()) {
                    setValidationErrors(prev => ({ ...prev, childName: false }));
                  }
                }}
                placeholder={t('enterChildName')}
                placeholderTextColor={validationErrors.childName ? '#FF6B6B' : '#999'}
              />
              {validationErrors.childName && (
                <Text style={styles.errorText}>{t('pleaseEnterName')}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, validationErrors.childAge && styles.inputLabelError]}>
                {t('childAge')} <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  validationErrors.childAge && styles.textInputError
                ]}
                value={childAge}
                onChangeText={(text) => {
                  setChildAge(text);
                  if (validationErrors.childAge && text.trim()) {
                    const normalizedAge = text.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
                    const age = parseInt(normalizedAge);
                    if (age && age >= 1 && age <= 12) {
                      setValidationErrors(prev => ({ ...prev, childAge: false }));
                    }
                  }
                }}
                placeholder={t('enterAge')}
                placeholderTextColor={validationErrors.childAge ? '#FF6B6B' : '#999'}
                keyboardType="numeric"
                maxLength={2}
              />
              {validationErrors.childAge && (
                <Text style={styles.errorText}>{t('pleaseEnterValidAge')}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <ThemeSelector
                selectedTheme={selectedTheme}
                onThemeSelect={(theme) => {
                  setSelectedTheme(theme);
                  if (validationErrors.customTheme && theme !== 'custom') {
                    setValidationErrors(prev => ({ ...prev, customTheme: false }));
                  }
                }}
                customTheme={customTheme}
                onCustomThemeChange={(text) => {
                  setCustomTheme(text);
                  if (validationErrors.customTheme && text.trim()) {
                    setValidationErrors(prev => ({ ...prev, customTheme: false }));
                  }
                }}
                hasError={validationErrors.customTheme}
              />
              {validationErrors.customTheme && (
                <Text style={styles.errorText}>{t('pleaseEnterCustomTheme')}</Text>
              )}
            </View>

            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageSelect={(lang) => setSelectedLanguage(lang)}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('numberOfPages')}</Text>
              <View style={styles.pageCountContainer}>
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((count) => {
                  const isDisabled = !settings.isPremium && count > usageLimits.maxPages;
                  return (
                    <TouchableOpacity
                      key={count}
                      style={[
                        styles.pageCountButton,
                        pageCount === count && styles.pageCountButtonSelected,
                        isDisabled && styles.pageCountButtonDisabled
                      ]}
                      onPress={() => {
                        if (isDisabled) {
                          setShowPremiumUpgrade(true);
                        } else {
                          setPageCount(count);
                        }
                      }}
                    >
                      <Text style={[
                        styles.pageCountText,
                        pageCount === count && styles.pageCountTextSelected,
                        isDisabled && styles.pageCountTextDisabled
                      ]}>
                        {count}
                      </Text>
                      {isDisabled && (
                        <Crown size={10} color="#FFD700" style={styles.pageCountCrown} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              {!settings.isPremium && (
                <Text style={styles.pageCountHint}>
                  Premium users can create stories up to 12 pages
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.createButton, isGenerating && styles.createButtonDisabled]}
              onPress={handleCreateStory}
              disabled={isGenerating}
            >
              <LinearGradient
                colors={isGenerating ? ['#CCC', '#999'] : ['#667eea', '#764ba2']}
                style={styles.createButtonGradient}
              >
                <Sparkles size={20} color="#FFF" />
                <Text style={styles.createButtonText}>
                  {isGenerating ? `${t('generating')} ${Math.round(generationProgress)}%` : t('createStory')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderStoryReader = () => {
    if (!selectedStory) return null;
    
    return (
      <Modal visible={true} animationType="slide" presentationStyle="fullScreen">
        <StoryReader
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <Text style={[styles.headerTitle, currentLanguage === 'ar' && styles.rtlText]}>{t('stories')}</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <StoryBanner onStoryPress={(story) => setSelectedStory(story)} />
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Flame size={20} color="#667eea" />
            <Text style={styles.statNumber}>{settings.currentStreak}</Text>
            <Text style={styles.statLabel}>{t('dayStreak')}</Text>
          </View>
          
          <View style={styles.statCard}>
            <BookOpen size={20} color="#4CAF50" />
            <Text style={styles.statNumber}>{stories.length}</Text>
            <Text style={styles.statLabel}>{t('storiesCreated')}</Text>
          </View>
          
          <View style={styles.statCard}>
            <Star size={20} color="#FFD700" />
            <Text style={[styles.statNumber, styles.planText]}>{settings.isPremium ? 'Premium' : 'Free'}</Text>
            <Text style={styles.statLabel}>Plan</Text>
          </View>
        </View>

        {/* Usage Limit Info */}
        <View style={styles.usageLimitCard}>
          <View style={styles.usageLimitHeader}>
            <Text style={styles.usageLimitTitle}>
              {settings.isPremium 
                ? `${t('dailyStories')}: Unlimited ✨` 
                : `${t('dailyStories')}: ${settings.dailyStoriesUsed}/${usageLimits.dailyStories}`
              }
            </Text>
            {!settings.isPremium && (
              <TouchableOpacity 
                onPress={() => setShowPremiumUpgrade(true)}
                style={styles.upgradeButton}
              >
                <Crown size={16} color="#FFD700" />
                <Text style={styles.upgradeButtonText}>{t('upgrade')}</Text>
              </TouchableOpacity>
            )}
          </View>
          {!settings.isPremium && (
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((settings.dailyStoriesUsed / usageLimits.dailyStories) * 100, 100)}%` }
                ]} 
              />
            </View>
          )}
          {settings.isPremium && (
            <View style={styles.premiumBadge}>
              <Crown size={16} color="#FFD700" />
              <Text style={styles.premiumBadgeText}>Premium Active</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.createStoryButton,
            !canCreateStory && styles.createStoryButtonDisabled
          ]}
          onPress={() => canCreateStory ? setShowCreateModal(true) : setShowPremiumUpgrade(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={canCreateStory ? ['#667eea', '#764ba2'] : ['#CCC', '#999']}
            style={styles.createStoryGradient}
          >
            <Plus size={24} color="#FFF" />
            <Text style={styles.createStoryText}>
              {canCreateStory ? t('createNewStory') : t('upgradeForMoreStories')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Banner Ad */}
        <BannerAd size="medium" style={{ marginHorizontal: 20 }} />

        <View style={styles.storiesSection}>
          <Text style={styles.sectionTitle}>{t('yourStories')}</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <BookOpen size={48} color="#CCC" />
              <Text style={styles.loadingText}>{t('loadingStories')}</Text>
            </View>
          ) : stories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <BookOpen size={48} color="#CCC" />
              <Text style={styles.emptyText}>{t('noStoriesYet')}</Text>
              <Text style={styles.emptySubtext}>
                {t('noStoriesSubtext')}
              </Text>
            </View>
          ) : (
            stories.map((story, index) => (
              <React.Fragment key={story.id}>
                <StoryCard
                  story={story}
                  onPress={() => setSelectedStory(story)}
                />
                {/* Show banner ad after every 3rd story */}
                {(index + 1) % 3 === 0 && (
                  <BannerAd size="small" style={{ marginHorizontal: 20, marginVertical: 8 }} />
                )}
              </React.Fragment>
            ))
          )}
        </View>
      </ScrollView>

      {renderCreateModal()}
      {renderStoryReader()}
      {renderErrorModal()}
      
      <PremiumUpgradeScreen
        visible={showPremiumUpgrade}
        onClose={() => setShowPremiumUpgrade(false)}
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
  },
  content: {
    flex: 1,
  },
  createStoryButton: {
    margin: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  createStoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
  },
  createStoryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
  },
  storiesSection: {
    flex: 1,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalGradient: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#FFF',
  },
  modalContent: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  createButton: {
    borderRadius: 16,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  errorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModal: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 40,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
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
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  usageLimitCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  usageLimitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  usageLimitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  createStoryButtonDisabled: {
    opacity: 0.6,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  uploadButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  pageCountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pageCountButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pageCountButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  pageCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  pageCountTextSelected: {
    color: '#FFF',
  },
  avatarOptions: {
    flex: 1,
    gap: 8,
  },
  storyModeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  storyModeButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  storyModeButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  storyModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  storyModeTextSelected: {
    color: '#FFF',
  },
  autoAvatarButton: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  autoAvatarButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  autoAvatarText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  autoAvatarTextSelected: {
    color: '#FFF',
  },
  genderSelectionContainer: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  genderButtonTextSelected: {
    color: '#FFF',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  avatarPlaceholderText: {
    fontSize: 24,
    marginBottom: 2,
  },
  avatarPlaceholderLabel: {
    fontSize: 8,
    color: '#666',
    fontWeight: '600',
  },
  removePhotoButton: {
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  pageCountButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#F0F0F0',
  },
  pageCountTextDisabled: {
    color: '#CCC',
  },
  pageCountCrown: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  pageCountHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'center',
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  requiredAsterisk: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputLabelError: {
    color: '#FF6B6B',
  },
  textInputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  modalCloseButtonDisabled: {
    opacity: 0.5,
  },
  modalCloseTextDisabled: {
    color: '#CCC',
  },
  planText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});