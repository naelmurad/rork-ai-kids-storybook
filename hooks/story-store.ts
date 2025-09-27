import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { Story, StoryGenerationRequest, StoryPage } from '@/types/story';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateText } from '@rork/toolkit-sdk';

const STORIES_KEY = 'stories';

// Helper function to validate image data
const validateImageData = (imageBase64: string, pageNumber: number): string => {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    console.log(`Page ${pageNumber}: No image data provided`);
    return '';
  }
  const trimmed = imageBase64.trim();
  if (trimmed === '' || trimmed.length < 50) {
    console.log(`Page ${pageNumber}: Image data too short (${trimmed.length} chars)`);
    return '';
  }
  if (trimmed === 'undefined' || trimmed === 'null' || trimmed === 'false') {
    console.log(`Page ${pageNumber}: Image data is invalid literal value`);
    return '';
  }
  if (trimmed.includes('undefined') || trimmed.includes('null') || trimmed.includes('error')) {
    console.log(`Page ${pageNumber}: Image data contains error indicators`);
    return '';
  }
  console.log(`Page ${pageNumber}: Valid image data (${trimmed.length} chars)`);
  return trimmed;
};

// Helper function to get language name for AI prompt
const getLanguageName = (languageCode: string): string => {
  const languageNames: { [key: string]: string } = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'it': 'Italian',
    'de': 'German',
    'zh': 'Chinese',
    'ar': 'Arabic'
  };
  return languageNames[languageCode] || 'English';
};

export const [StoryProvider, useStories] = createContextHook(() => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const queryClient = useQueryClient();

  // Clear all existing stories on app start
  const clearAllStories = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORIES_KEY);
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      console.log('All stories cleared successfully');
    } catch (error) {
      console.error('Error clearing stories:', error);
    }
  }, [queryClient]);

  const storiesQuery = useQuery({
    queryKey: ['stories'],
    queryFn: async (): Promise<Story[]> => {
      try {
        const stored = await AsyncStorage.getItem(STORIES_KEY);
        if (stored) {
          const parsedStories = JSON.parse(stored);
          console.log(`Loaded ${parsedStories.length} stories from storage`);
          return Array.isArray(parsedStories) ? parsedStories : [];
        }
        console.log('No stories found in storage');
        return [];
      } catch (error) {
        console.error('Error loading stories:', error);
        return [];
      }
    }
  });

  const saveStoriesMutation = useMutation({
    mutationFn: async (stories: Story[]) => {
      if (!Array.isArray(stories)) return [];
      await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(stories));
      return stories;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    }
  });

  const { mutateAsync: saveStories } = saveStoriesMutation;

  const generateStory = useCallback(async (request: StoryGenerationRequest, childAvatar?: string): Promise<Story> => {
    console.log('=== STORY STORE: Starting story generation ===');
    console.log('Request:', JSON.stringify(request, null, 2));
    console.log('Avatar provided:', !!childAvatar, typeof childAvatar);
    console.log('Avatar length:', childAvatar?.length || 0);
    
    // Prevent concurrent generations
    if (isGenerating) {
      console.log('Story generation already in progress, rejecting new request');
      throw new Error('Story generation already in progress');
    }
    
    // Validate request first
    if (!request.childName || !request.childName.trim()) {
      throw new Error('Child name is required');
    }
    if (!request.childAge || request.childAge < 1 || request.childAge > 12) {
      throw new Error('Valid child age is required (1-12)');
    }
    if (!request.theme || !request.theme.trim()) {
      throw new Error('Story theme is required');
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Generate story text with simplified approach
      console.log('=== STORY STORE: Generating story text ===');
      setGenerationProgress(20);
      
      const expectedPages = request.pageCount || 5;
      const languageName = getLanguageName(request.language);
      
      console.log('Making story generation API request...');
      console.log('Request details:', {
        childName: request.childName,
        childAge: request.childAge,
        theme: request.theme,
        language: request.language,
        pageCount: expectedPages,
        gender: request.gender
      });
      
      // Enhanced story prompt with explicit language instruction
      const storyPrompt = `CRITICAL INSTRUCTION: You MUST write the entire response in ${languageName} language only. Do not use any English words.

${request.language === 'ar' ? 'اكتب القصة كاملة باللغة العربية فقط. لا تستخدم أي كلمات إنجليزية.' : ''}

Create a ${expectedPages}-page children's story about ${request.childName}, a ${request.childAge}-year-old ${request.gender}. Theme: ${request.theme}.

Return ONLY valid JSON in this exact format (but with all text content in ${languageName}):
{
  "title": "Story title in ${languageName}",
  "pages": [
    {"text": "Page 1 story text in ${languageName}"},
    {"text": "Page 2 story text in ${languageName}"},
    {"text": "Page 3 story text in ${languageName}"},
    {"text": "Page 4 story text in ${languageName}"},
    {"text": "Page 5 story text in ${languageName}"}
  ]
}

Make exactly ${expectedPages} pages. Use ${request.childName} as the main character throughout. REMEMBER: ALL STORY CONTENT MUST BE IN ${languageName} LANGUAGE.`;
      
      // Use direct API call instead of SDK for better error handling
      console.log('Making direct API call to text generation endpoint...');
      const textResponse = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: storyPrompt
            }
          ]
        })
      });
      
      if (!textResponse.ok) {
        const errorText = await textResponse.text();
        console.error('Text generation API error:', textResponse.status, errorText);
        throw new Error(`Text generation failed: ${textResponse.status} - ${errorText}`);
      }
      
      const storyResponse = await textResponse.text();
      
      console.log('Raw API response received');
      
      if (!storyResponse || storyResponse.length < 10) {
        throw new Error('Empty response from story generation API');
      }
      
      console.log('Story generation response received:', {
        responseLength: storyResponse.length,
        responsePreview: storyResponse.substring(0, 200)
      });
      
      let parsedStory;
      
      try {
        // Clean and parse the response
        let cleanedResponse = storyResponse.trim();
        
        // Remove markdown code blocks if present
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
        }
        
        // Try to find JSON in the response
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[0];
        }
        
        console.log('Attempting to parse JSON response...');
        parsedStory = JSON.parse(cleanedResponse);
        
        // Validate the parsed story
        if (!parsedStory.title || !parsedStory.pages || !Array.isArray(parsedStory.pages)) {
          throw new Error('Invalid story structure');
        }
        
        // Ensure we have the right number of pages
        if (parsedStory.pages.length !== expectedPages) {
          console.warn(`Expected ${expectedPages} pages, got ${parsedStory.pages.length}. Adjusting...`);
          
          // Adjust pages to match expected count
          if (parsedStory.pages.length > expectedPages) {
            parsedStory.pages = parsedStory.pages.slice(0, expectedPages);
          } else {
            // Add missing pages
            while (parsedStory.pages.length < expectedPages) {
              const pageNum = parsedStory.pages.length + 1;
              parsedStory.pages.push({
                text: `${request.childName} continued the ${request.theme} adventure on page ${pageNum}.`
              });
            }
          }
        }
        
        console.log('Successfully parsed story:', {
          title: parsedStory.title,
          pageCount: parsedStory.pages.length
        });
        
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.error('Failed to parse content:', storyResponse.substring(0, 500));
        
        // Create fallback story
        console.log('Creating fallback story...');
        parsedStory = {
          title: `${request.childName}'s ${request.theme} Adventure`,
          pages: [] as { text: string }[]
        };
        
        // Generate simple fallback pages
        const fallbackTexts = [
          `Once upon a time, there was a ${request.childAge}-year-old ${request.gender} named ${request.childName}.`,
          `${request.childName} loved to go on ${request.theme} adventures.`,
          `One day, ${request.childName} discovered something amazing during a ${request.theme} journey.`,
          `${request.childName} learned something important from this ${request.theme} experience.`,
          `And ${request.childName} lived happily ever after, always remembering this wonderful ${request.theme} adventure.`
        ];
        
        for (let i = 0; i < expectedPages; i++) {
          const pageData: { text: string } = {
            text: fallbackTexts[i] || `${request.childName} continued the ${request.theme} adventure.`
          };
          parsedStory.pages.push(pageData);
        }
      }

      setGenerationProgress(40);

      // Generate pages with or without images based on request
      const pages: StoryPage[] = [];
      const totalPages = Math.min(parsedStory.pages.length, expectedPages);
      
      if (request.includeIllustrations) {
        console.log('Starting illustration generation...');
        
        // Validate and clean avatar URI first
        let validAvatarUri = '';
        if (childAvatar && typeof childAvatar === 'string' && childAvatar.trim() !== '' && childAvatar !== 'undefined' && childAvatar !== 'null') {
          try {
            const trimmedAvatar = childAvatar.trim();
            if (trimmedAvatar.startsWith('data:image/')) {
              validAvatarUri = trimmedAvatar.replace(/^data:image\/[a-z]+;base64,/, '');
            } else if (trimmedAvatar.startsWith('http')) {
              validAvatarUri = trimmedAvatar;
            } else {
              validAvatarUri = trimmedAvatar;
            }
            console.log('Valid avatar URI prepared for illustrations, length:', validAvatarUri.length);
          } catch (error) {
            console.error('Error processing avatar URI:', error);
            validAvatarUri = '';
          }
        } else {
          console.log('No valid avatar provided for illustrations');
        }
        
        // Create detailed, consistent character descriptions
        const getCharacterDescription = (gender: string, age: number) => {
          if (gender === 'girl') {
            return {
              appearance: `${age}-year-old girl with shoulder-length brown hair in pigtails, bright green eyes, fair skin, wearing a pink t-shirt and blue jeans, white sneakers`,
              style: 'cartoon style, Disney-like, consistent character design'
            };
          } else {
            return {
              appearance: `${age}-year-old boy with short dark brown hair, brown eyes, fair skin, wearing a red t-shirt and blue shorts, white sneakers`,
              style: 'cartoon style, Disney-like, consistent character design'
            };
          }
        };
        
        const characterInfo = getCharacterDescription(request.gender || 'boy', request.childAge);
        const baseCharacterPrompt = `MAIN CHARACTER DESCRIPTION (MUST BE IDENTICAL IN ALL PAGES): ${characterInfo.appearance}. CHARACTER NAME: ${request.childName}. CRITICAL: This exact character appearance must be maintained throughout all illustrations - same hair, same eyes, same face, same clothes, same proportions.`;
        
        // Generate images with better error handling and crash prevention
        console.log('Starting safe image generation...');
        
        // Create all image generation promises with better error handling
        const imagePromises = parsedStory.pages.slice(0, totalPages).map(async (page: { text: string }, i: number) => {
          console.log(`Starting illustration generation for page ${i + 1}/${totalPages}...`);
          
          try {
            // Enhanced image generation with better prompts
            const pageContext = page.text.substring(0, 100); // Use page text for context
            const safePrompt = `${baseCharacterPrompt} SCENE: ${pageContext}. Children's book illustration showing ${request.childName} in a ${request.theme} adventure. Bright, colorful, cartoon style, Disney-like animation, child-friendly, safe content, high quality illustration.`;
            
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout per image
            
            const imageResponse = await fetch('https://toolkit.rork.com/images/generate/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: safePrompt,
                size: '1024x1024'
              }),
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              if (imageData?.image?.base64Data && typeof imageData.image.base64Data === 'string') {
                const base64Data = imageData.image.base64Data.trim();
                if (base64Data.length > 100) { // Basic validation
                  console.log(`✅ Page ${i + 1} illustration generated successfully`);
                  return {
                    pageIndex: i,
                    imageBase64: base64Data
                  };
                }
              }
              console.log(`❌ Page ${i + 1} - invalid image data received`);
            } else {
              console.log(`❌ Page ${i + 1} API error: ${imageResponse.status}`);
            }
          } catch (error) {
            console.error(`❌ Page ${i + 1} generation error:`, error);
            // Don't throw, just return empty result
          }
          
          return {
            pageIndex: i,
            imageBase64: ''
          };
        });
        
        // Wait for all images to complete with better error handling
        console.log('Waiting for all illustrations to complete...');
        let imageResults;
        try {
          // Process images in smaller batches to prevent timeout
          const batchSize = 2;
          const batches = [];
          for (let i = 0; i < imagePromises.length; i += batchSize) {
            batches.push(imagePromises.slice(i, i + batchSize));
          }
          
          const allResults = [];
          for (const batch of batches) {
            console.log(`Processing batch of ${batch.length} images...`);
            const batchResults = await Promise.allSettled(batch);
            allResults.push(...batchResults);
            // Small delay between batches
            if (batches.indexOf(batch) < batches.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
          
          imageResults = allResults;
        } catch (error) {
          console.error('Image generation failed:', error);
          // Create empty results if timeout
          imageResults = imagePromises.map(() => ({ status: 'rejected' as const, reason: 'timeout' }));
        }
        
        // Process results and create pages
        const imageMap = new Map<number, string>();
        let successfulImages = 0;
        
        imageResults.forEach((result: any, index: number) => {
          if (result.status === 'fulfilled' && result.value.imageBase64) {
            const validImage = validateImageData(result.value.imageBase64, index + 1);
            if (validImage) {
              imageMap.set(result.value.pageIndex, validImage);
              successfulImages++;
            }
          }
        });
        
        console.log(`Generated ${successfulImages}/${totalPages} illustrations successfully`);
        
        // Create pages with images
        for (let i = 0; i < totalPages; i++) {
          const page = parsedStory.pages[i];
          const imageBase64 = imageMap.get(i) || '';
          
          pages.push({
            id: `page-${i}`,
            text: page.text,
            imageBase64: imageBase64
          });
        }
        
        const pagesWithImages = pages.filter(p => p.imageBase64 && p.imageBase64.length > 50).length;
        console.log(`✅ Story complete: ${pagesWithImages}/${totalPages} pages have illustrations`);
        
        // If less than 50% of images were generated, log a warning but continue
        if (pagesWithImages < totalPages / 2 && request.includeIllustrations) {
          console.warn(`Only ${pagesWithImages}/${totalPages} illustrations generated - some pages will be text-only`);
        }
        
        setGenerationProgress(85);
      } else {
        // Text-only mode - no images
        for (let i = 0; i < totalPages; i++) {
          const page = parsedStory.pages[i];
          pages.push({
            id: `page-${i}`,
            text: page.text,
            imageBase64: ''
          });
        }
        setGenerationProgress(85);
      }

      setGenerationProgress(100);

      const story: Story = {
        id: Date.now().toString(),
        title: parsedStory.title,
        childName: request.childName,
        childAge: request.childAge,
        theme: request.theme,
        language: request.language,
        pages,
        includeIllustrations: request.includeIllustrations || false,
        gender: request.gender,
        createdAt: new Date().toISOString()
      };

      // Save to storage
      const currentStories = storiesQuery.data || [];
      const updatedStories = [story, ...currentStories];
      console.log(`Saving story "${story.title}" to storage. Total stories: ${updatedStories.length}`);
      await saveStories(updatedStories);
      console.log('Story saved successfully');

      return story;
    } catch (error) {
      console.error('=== STORY GENERATION FAILED ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Request that failed:', JSON.stringify(request, null, 2));
      
      // Force cleanup on error
      setIsGenerating(false);
      setGenerationProgress(0);
      
      // Re-throw the error for the UI to handle
      throw error;
    } finally {
      console.log('=== STORY GENERATION CLEANUP ===');
      // Ensure cleanup always happens immediately
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [storiesQuery.data, saveStories, isGenerating]);

  const deleteStory = useCallback(async (storyId: string) => {
    const currentStories = storiesQuery.data || [];
    const updatedStories = currentStories.filter(s => s.id !== storyId);
    await saveStories(updatedStories);
  }, [storiesQuery.data, saveStories]);

  // Simple test story generation for debugging
  const generateTestStory = useCallback(async (request: StoryGenerationRequest): Promise<Story> => {
    console.log('=== GENERATING TEST STORY WITH ILLUSTRATIONS ===');
    console.log('Test request:', request);
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      setGenerationProgress(20);
      
      const expectedPages = request.pageCount || 3; // Fewer pages for testing
      const pages: StoryPage[] = [];
      
      // Generate test story with actual illustrations
      if (request.includeIllustrations) {
        console.log('Generating test illustrations...');
        
        for (let i = 0; i < expectedPages; i++) {
          const pageText = `Page ${i + 1}: ${request.childName} went on a ${request.theme} adventure. This is a test story to verify the illustration system is working.`;
          let imageBase64 = '';
          
          try {
            console.log(`Generating test illustration ${i + 1}/${expectedPages}...`);
            
            // Simple illustration prompt for testing
            const testPrompt = `Children's book illustration: A ${request.childAge}-year-old ${request.gender} named ${request.childName} on a ${request.theme} adventure. Cartoon style, colorful, friendly, safe for children. Page ${i + 1} of ${expectedPages}.`;
            
            const imageResponse = await fetch('https://toolkit.rork.com/images/generate/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: testPrompt,
                size: '1024x1024'
              })
            });

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              if (imageData.image && imageData.image.base64Data) {
                imageBase64 = imageData.image.base64Data;
                console.log(`✅ Test illustration ${i + 1} generated successfully (${imageBase64.length} chars)`);
              } else {
                console.log(`❌ Test illustration ${i + 1} - no image data in response:`, imageData);
              }
            } else {
              const errorText = await imageResponse.text();
              console.log(`❌ Test illustration ${i + 1} API error ${imageResponse.status}:`, errorText);
            }
            
            // Small delay between requests
            if (i < expectedPages - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
          } catch (error) {
            console.error(`❌ Error generating test illustration ${i + 1}:`, error);
          }
          
          pages.push({
            id: `page-${i}`,
            text: pageText,
            imageBase64: imageBase64
          });
          
          const progress = 20 + ((i + 1) / expectedPages) * 60;
          setGenerationProgress(progress);
        }
        
        const pagesWithImages = pages.filter(p => p.imageBase64 && p.imageBase64.length > 10).length;
        console.log(`✅ Test story complete: ${pagesWithImages}/${expectedPages} pages have illustrations`);
        
      } else {
        // Text-only test story
        for (let i = 0; i < expectedPages; i++) {
          pages.push({
            id: `page-${i}`,
            text: `Page ${i + 1}: ${request.childName} went on a ${request.theme} adventure. This is a test story to verify the system is working.`,
            imageBase64: ''
          });
        }
      }
      
      setGenerationProgress(100);
      
      const story: Story = {
        id: Date.now().toString(),
        title: `${request.childName}'s Test ${request.theme} Story`,
        childName: request.childName,
        childAge: request.childAge,
        theme: request.theme,
        language: request.language,
        pages,
        includeIllustrations: request.includeIllustrations || false,
        gender: request.gender,
        createdAt: new Date().toISOString()
      };
      
      // Save to storage
      const currentStories = storiesQuery.data || [];
      const updatedStories = [story, ...currentStories];
      console.log(`Saving test story "${story.title}" to storage`);
      await saveStories(updatedStories);
      console.log('✅ Test story saved successfully');
      
      return story;
    } catch (error) {
      console.error('❌ Test story generation failed:', error);
      throw error;
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [storiesQuery.data, saveStories]);

  return useMemo(() => ({
    stories: storiesQuery.data || [],
    isLoading: storiesQuery.isLoading,
    isGenerating,
    generationProgress,
    generateStory,
    generateTestStory,
    deleteStory,
    clearAllStories
  }), [storiesQuery.data, storiesQuery.isLoading, isGenerating, generationProgress, generateStory, generateTestStory, deleteStory, clearAllStories]);
});