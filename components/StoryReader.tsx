import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronRight, Pause, Volume2, Share, Download } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import * as Sharing from 'expo-sharing';

import * as Print from 'expo-print';
import { Story } from '@/types/story';

interface StoryReaderProps {
  story: Story;
  onClose: () => void;
}



export default function StoryReader({ story, onClose }: StoryReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const scrollViewRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const stopNarration = () => {
    if (isPlaying) {
      if (Platform.OS === 'web') {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } else {
        Speech.stop();
      }
      setIsPlaying(false);
    }
  };

  const goToNextPage = () => {
    if (currentPage < story.pages.length - 1) {
      stopNarration();
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      scrollViewRef.current?.scrollTo({ x: nextPage * screenWidth, animated: true });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      stopNarration();
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      scrollViewRef.current?.scrollTo({ x: prevPage * screenWidth, animated: true });
    }
  };

  const toggleNarration = async () => {
    if (isPlaying) {
      if (Platform.OS === 'web') {
        // Stop web speech synthesis
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } else {
        Speech.stop();
      }
      setIsPlaying(false);
    } else {
      const currentPageText = story.pages[currentPage]?.text || '';
      
      if (!currentPageText.trim()) {
        Alert.alert('No Text', 'No text available to read on this page.');
        return;
      }
      
      setIsPlaying(true);
      console.log('Reading text:', currentPageText);
      console.log('Story language:', story.language);
      
      if (Platform.OS === 'web') {
        // Use Web Speech API
        if ('speechSynthesis' in window) {
          try {
            // Stop any existing speech
            window.speechSynthesis.cancel();
            
            // Small delay to ensure cancellation is processed
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const utterance = new SpeechSynthesisUtterance(currentPageText);
            
            // Set language with fallbacks
            if (story.language === 'ar') {
              utterance.lang = 'ar-SA';
              // Try to find Arabic voice
              const voices = window.speechSynthesis.getVoices();
              console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
              const arabicVoice = voices.find(voice => 
                voice.lang.startsWith('ar') || voice.name.toLowerCase().includes('arabic')
              );
              if (arabicVoice) {
                utterance.voice = arabicVoice;
                console.log('Using Arabic voice:', arabicVoice.name);
              } else {
                console.log('No Arabic voice found, using default');
                // Try alternative Arabic language codes
                utterance.lang = 'ar';
              }
            } else {
              utterance.lang = 'en-US';
              // Try to find English voice
              const voices = window.speechSynthesis.getVoices();
              const englishVoice = voices.find(voice => 
                voice.lang.startsWith('en') && voice.name.toLowerCase().includes('english')
              ) || voices.find(voice => voice.lang.startsWith('en'));
              if (englishVoice) {
                utterance.voice = englishVoice;
                console.log('Using English voice:', englishVoice.name);
              }
            }
            
            utterance.pitch = 1.0;
            utterance.rate = 0.8; // Slightly faster for better flow
            utterance.volume = 1.0;
            
            utterance.onend = () => {
              console.log('Speech ended');
              setIsPlaying(false);
            };
            
            utterance.onerror = (event) => {
              console.error('Speech synthesis error:', event);
              setIsPlaying(false);
              Alert.alert('Speech Error', 'Failed to read the text. Please try again.');
            };
            
            utterance.onstart = () => {
              console.log('Speech started successfully');
            };
            
            console.log('Starting speech synthesis with settings:', {
              lang: utterance.lang,
              voice: utterance.voice?.name,
              text: currentPageText.substring(0, 50) + '...'
            });
            
            // Force voices to load if not already loaded
            if (window.speechSynthesis.getVoices().length === 0) {
              window.speechSynthesis.getVoices();
              await new Promise(resolve => {
                window.speechSynthesis.onvoiceschanged = () => {
                  resolve(void 0);
                };
                // Fallback timeout
                setTimeout(() => resolve(void 0), 1000);
              });
            }
            
            window.speechSynthesis.speak(utterance);
            
            // Check if speech actually started
            setTimeout(() => {
              if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                console.log('Speech failed to start, retrying...');
                setIsPlaying(false);
                // Retry once
                setTimeout(() => {
                  if (!isPlaying) {
                    window.speechSynthesis.speak(utterance);
                    setIsPlaying(true);
                  }
                }, 500);
              }
            }, 500);
            
          } catch (error) {
            console.error('Speech setup error:', error);
            setIsPlaying(false);
            Alert.alert('Speech Error', 'Failed to initialize speech. Please try again.');
          }
        } else {
          console.log('Speech synthesis not supported on this browser');
          Alert.alert('Not Supported', 'Speech synthesis is not supported on this browser');
          setIsPlaying(false);
        }
      } else {
        // Native speech synthesis
        const speechOptions = {
          language: story.language === 'ar' ? 'ar-SA' : 'en-US',
          pitch: 1.0,
          rate: 0.8,
          onDone: () => {
            console.log('Native speech done');
            setIsPlaying(false);
          },
          onError: (error: any) => {
            console.error('Native speech synthesis error:', error);
            setIsPlaying(false);
            Alert.alert('Speech Error', 'Failed to read the text. Please try again.');
          },
        };
        
        try {
          console.log('Starting native speech with options:', speechOptions);
          await Speech.speak(currentPageText, speechOptions);
        } catch (error) {
          console.error('Failed to start native speech:', error);
          Alert.alert('Speech Error', 'Failed to start speech. Please try again.');
          setIsPlaying(false);
        }
      }
    }
  };

  const generatePDFContent = () => {
    const pagesHtml = story.pages.map((page, index) => {
      const hasValidImage = page.imageBase64 && page.imageBase64.trim() !== '';
      const imageHtml = hasValidImage 
        ? `<img src="data:image/png;base64,${page.imageBase64}" style="width: 100%; max-width: 400px; height: auto; border-radius: 8px; margin-bottom: 16px;" />`
        : '';
      
      return `
        <div style="page-break-after: ${index === story.pages.length - 1 ? 'avoid' : 'always'}; padding: 20px; text-align: center; min-height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <h3 style="color: #8B4513; margin-bottom: 20px; font-family: Arial, sans-serif;">Page ${index + 1}</h3>
          ${imageHtml}
          <p style="font-size: 16px; line-height: 1.6; color: #333; max-width: 500px; text-align: ${story.language === 'ar' ? 'right' : 'left'}; direction: ${story.language === 'ar' ? 'rtl' : 'ltr'}; font-family: Arial, sans-serif; margin: 0;">
            ${page.text}
          </p>
        </div>
      `;
    }).join('');
    
    return `
      <html>
        <head>
          <meta charset="utf-8">
          <title>${story.title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #FFF8E1 0%, #F3E5AB 100%);
            }
            .cover {
              text-align: center;
              padding: 60px 20px;
              page-break-after: always;
              min-height: 80vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #8B4513;
              margin-bottom: 20px;
            }
            .subtitle {
              font-size: 18px;
              color: #666;
              margin-bottom: 10px;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="cover">
            <h1 class="title">${story.title}</h1>
            <p class="subtitle">A magical story for ${story.childName}</p>
            <p class="subtitle">Age: ${story.childAge} | Theme: ${story.theme}</p>
            <p class="subtitle">Created: ${new Date(story.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
          ${pagesHtml}
        </body>
      </html>
    `;
  };

  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        // Generate and download PDF on web
        const htmlContent = generatePDFContent();
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        
        // Create a download link
        const link = document.createElement('a');
        link.href = uri;
        const fileName = story.title.replace(/[^a-zA-Z0-9\u0600-\u06FF\u4e00-\u9fff]/g, '_').substring(0, 50);
        link.download = `${fileName || 'Story'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        Alert.alert('Success', 'PDF has been downloaded!');
      } else {
        // Generate PDF and share on mobile
        const htmlContent = generatePDFContent();
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          const fileName = story.title.replace(/[^a-zA-Z0-9\u0600-\u06FF\u4e00-\u9fff]/g, '_').substring(0, 50) || 'Story';
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Share Story PDF',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert('Sharing not available', 'Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('Error sharing story:', error);
      Alert.alert('Share Failed', 'Failed to create PDF. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    await handleShare(); // Use the same PDF generation logic
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const pageIndex = Math.round(contentOffset.x / screenWidth);
    setCurrentPage(pageIndex);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF8E1', '#F3E5AB']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ChevronLeft size={24} color="#8B4513" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {story.title}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Share size={20} color="#8B4513" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDownloadPDF} style={styles.actionButton}>
              <Download size={20} color="#8B4513" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleNarration} style={styles.playButton}>
              {isPlaying ? (
                <Pause size={24} color="#8B4513" />
              ) : (
                <Volume2 size={24} color="#8B4513" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Story Pages */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={[
            styles.pagesContainer,
            story.language === 'ar' && styles.rtlPagesContainer
          ]}
        >
          {story.pages.map((page, index) => {
            const raw = page.imageBase64 ?? '';
            
            // Simplified and more lenient image validation
            const hasValidImage = (() => {
              if (!raw || typeof raw !== 'string') {
                return false;
              }
              const trimmed = raw.trim();
              if (trimmed === '' || trimmed.length < 50) {
                return false;
              }
              if (trimmed === 'undefined' || trimmed === 'null' || trimmed === 'false') {
                return false;
              }
              // More lenient validation - just check if it looks like valid data
              if (trimmed.includes('undefined') || trimmed.includes('null') || trimmed.includes('error')) {
                return false;
              }
              console.log(`Page ${index + 1}: Valid image data (${trimmed.length} chars)`);
              return true;
            })();
            
            let imageUri: string | null = null;
            if (hasValidImage) {
              try {
                if (raw.startsWith('data:image/')) {
                  imageUri = raw;
                } else {
                  imageUri = `data:image/png;base64,${raw}`;
                }
                
                // Final validation - ensure the URI has actual data
                const base64Part = imageUri.split(',')[1];
                if (!base64Part || base64Part.length < 20) {
                  console.log(`Page ${index + 1}: Final validation failed - insufficient base64 data`);
                  imageUri = null;
                } else {
                  console.log(`Page ${index + 1}: Final image URI created successfully`);
                }
              } catch (error) {
                console.error(`Error creating image URI for page ${index + 1}:`, error);
                imageUri = null;
              }
            }
            
            console.log(`Page ${index + 1} image validation:`, {
              hasImageBase64: !!raw,
              imageLength: raw?.length || 0,
              hasValidImage,
              finalImageUri: imageUri ? 'valid' : 'null'
            });
            
            return (
            <View key={page.id} style={[
              styles.page, 
              { width: screenWidth },
              story.language === 'ar' && styles.rtlPage
            ]}>
              <View style={styles.pageContent}>
                {imageUri && imageUri.trim() !== '' ? (
                  <View style={styles.fullPageImageContainer}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.fullPageImage}
                      resizeMode="cover"
                      onError={(error) => {
                        console.error(`Image load error for page ${index + 1}:`, {
                          error: error.nativeEvent?.error,
                          uri: imageUri?.substring(0, 100) + '...'
                        });
                      }}
                      onLoad={() => {
                        console.log(`Image loaded successfully for page ${index + 1}`);
                      }}
                      onLoadStart={() => {
                        console.log(`Image load started for page ${index + 1}`);
                      }}
                    />
                    <View style={styles.textOverlay}>
                      <View style={styles.textBackground}>
                        <Text style={[
                          styles.overlayText,
                          story.language === 'ar' && styles.arabicText
                        ]}>
                          {page.text}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.textOnlyContainer}>
                    <Text style={[
                      styles.pageText,
                      story.language === 'ar' && styles.arabicText
                    ]}>
                      {page.text}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            );
          })}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={goToPreviousPage}
            style={[styles.navButton, currentPage === 0 && styles.navButtonDisabled]}
            disabled={currentPage === 0}
          >
            <ChevronLeft size={20} color={currentPage === 0 ? '#CCC' : '#8B4513'} />
          </TouchableOpacity>

          <View style={styles.pageIndicator}>
            <Text style={styles.pageNumber}>
              {currentPage + 1} / {story.pages.length}
            </Text>
          </View>

          <TouchableOpacity
            onPress={goToNextPage}
            style={[styles.navButton, currentPage === story.pages.length - 1 && styles.navButtonDisabled]}
            disabled={currentPage === story.pages.length - 1}
          >
            <ChevronRight size={20} color={currentPage === story.pages.length - 1 ? '#CCC' : '#8B4513'} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  playButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  pagesContainer: {
    flex: 1,
  },
  rtlPagesContainer: {
    transform: [{ scaleX: -1 }],
  },
  page: {
    paddingHorizontal: 20,
  },
  rtlPage: {
    transform: [{ scaleX: -1 }],
  },
  pageContent: {
    flex: 1,
    borderRadius: 16,
    marginHorizontal: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  fullPageImageContainer: {
    flex: 1,
    position: 'relative',
  },
  fullPageImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  textBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  overlayText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  textOnlyContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  pageText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  arabicText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  pageIndicator: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pageNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
  },
});