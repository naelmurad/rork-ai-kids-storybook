import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { Story, StoryGenerationRequest, StoryPage } from '@/types/story';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORIES_KEY = 'stories';

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
    console.log('Starting story generation with request:', request);
    console.log('Avatar provided:', !!childAvatar, typeof childAvatar);
    
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Generate story text
      console.log('Generating story text...');
      setGenerationProgress(20);
      
      const storyResponse = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a children's story writer. Create a beautiful, age-appropriate bedtime story in ${getLanguageName(request.language)}. The story should be exactly ${request.pageCount || 5} pages long, with each page having 2-3 sentences. Make it engaging, educational, and suitable for a ${request.childAge}-year-old child. Always respond with valid JSON only. IMPORTANT: Write the ENTIRE story (title and all page text) in ${getLanguageName(request.language)} language.`
            },
            {
              role: 'user',
              content: `Create a ${request.theme} story for ${request.childName}, age ${request.childAge}. The child's name is "${request.childName}" and they are ${request.childAge} years old. IMPORTANT: Write the ENTIRE story (including the child's name and all text) in ${getLanguageName(request.language)} language. The main character should be the SAME PERSON throughout the entire story - ${request.childName} is a ${request.childAge}-year-old ${request.gender}. Keep the character consistent in appearance, personality, and actions across all pages. CRITICAL: Use ONLY the name "${request.childName}" throughout the story - this name should appear in ${getLanguageName(request.language)} language in the story text. Format the response as JSON with this exact structure:
              {
                "title": "Story Title in ${getLanguageName(request.language)}",
                "pages": [
                  ${Array.from({length: request.pageCount || 5}, (_, i) => `{"text": "Page ${i + 1} text here in ${getLanguageName(request.language)}"}`).join(',\n                  ')}
                ]
              }
              Make sure there are exactly ${request.pageCount || 5} pages. Use the child's name ${request.childName} throughout the story in ${getLanguageName(request.language)} language. Remember: ${request.childName} is the ONLY main character and should remain consistent.`
            }
          ]
        })
      });

      if (!storyResponse.ok) {
        console.error('Story generation failed:', storyResponse.status, storyResponse.statusText);
        throw new Error(`Failed to generate story: ${storyResponse.status}`);
      }

      const storyData = await storyResponse.json();
      console.log('Story generation response received');
      let parsedStory;
      
      try {
        // Clean the response to ensure it's valid JSON
        let cleanedResponse = storyData.completion.trim();
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
        }
        parsedStory = JSON.parse(cleanedResponse);
        
        // Ensure we have the correct number of pages
        const expectedPages = request.pageCount || 5;
        if (!parsedStory.pages || parsedStory.pages.length !== expectedPages) {
          throw new Error('Invalid page count');
        }
      } catch (error) {
        console.error('JSON parsing error:', error);
        // Fallback if JSON parsing fails - create requested number of pages
        const expectedPages = request.pageCount || 5;
        const fallbackText = storyData.completion || `Once upon a time, ${request.childName} went on a wonderful ${request.theme} adventure.`;
        const sentences = fallbackText.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
        const pages = [];
        for (let i = 0; i < expectedPages; i++) {
          const pageText = sentences.slice(i * 2, (i + 1) * 2).join('. ') + '.';
          pages.push({ text: pageText || `${request.childName} continued the ${request.theme} adventure.` });
        }
        parsedStory = {
          title: `${request.childName}'s ${request.theme} Adventure`,
          pages
        };
      }

      setGenerationProgress(40);

      // Generate pages with or without images based on request
      const pages: StoryPage[] = [];
      const expectedPages = request.pageCount || 5;
      const totalPages = Math.min(parsedStory.pages.length, expectedPages);
      
      if (request.includeIllustrations) {
        console.log('Starting illustration generation...');
        
        // Validate and clean avatar URI first
        let validAvatarUri = '';
        if (childAvatar && typeof childAvatar === 'string' && childAvatar.trim() !== '') {
          try {
            if (childAvatar.startsWith('data:image/')) {
              validAvatarUri = childAvatar.replace(/^data:image\/[a-z]+;base64,/, '');
            } else if (childAvatar.startsWith('http')) {
              validAvatarUri = childAvatar;
            } else {
              validAvatarUri = childAvatar;
            }
            console.log('Valid avatar URI prepared for illustrations');
          } catch (error) {
            console.error('Error processing avatar URI:', error);
            validAvatarUri = '';
          }
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
        
        // Generate images sequentially to avoid overwhelming the API and reduce crashes
        console.log('Starting sequential image generation for stability...');
        
        for (let i = 0; i < totalPages; i++) {
          const page = parsedStory.pages[i];
          let imageBase64 = '';
          
          try {
            console.log(`Generating illustration for page ${i + 1}/${totalPages}...`);
            
            // Try avatar-based generation first if we have a valid avatar
            if (validAvatarUri && validAvatarUri.length > 10) {
              try {
                let avatarBase64 = '';
                
                if (validAvatarUri.startsWith('http')) {
                  // Fetch and convert URL to base64
                  const imageResponse = await fetch(validAvatarUri);
                  if (imageResponse.ok) {
                    const imageBlob = await imageResponse.blob();
                    const reader = new FileReader();
                    avatarBase64 = await new Promise((resolve, reject) => {
                      reader.onload = () => {
                        const result = reader.result as string;
                        resolve(result.replace(/^data:image\/[a-z]+;base64,/, ''));
                      };
                      reader.onerror = reject;
                      reader.readAsDataURL(imageBlob);
                    });
                  }
                } else {
                  avatarBase64 = validAvatarUri;
                }
                
                if (avatarBase64 && avatarBase64.length > 10) {
                  const editResponse = await fetch('https://toolkit.rork.com/images/edit/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      prompt: `Create a children's book illustration for page ${i + 1} of ${expectedPages}. Scene: "${page.text}". Use the child from the provided avatar image as the ONLY main character. CRITICAL: The character must look EXACTLY like the avatar in every detail - same face, same hair, same features. Make it ${characterInfo.style}, colorful, friendly, and safe for children. Theme: ${request.theme}. This is ${request.childName}, maintain identical appearance. NO OTHER CHILDREN in the scene. NO TEXT OR WRITING in the image.`,
                      images: [{ type: 'image', image: avatarBase64 }]
                    })
                  });
                  
                  if (editResponse.ok) {
                    const editData = await editResponse.json();
                    if (editData.image && editData.image.base64Data) {
                      imageBase64 = editData.image.base64Data;
                      console.log(`Successfully generated illustration with avatar for page ${i + 1}`);
                    }
                  }
                }
              } catch (error) {
                console.error(`Error with avatar-based generation for page ${i + 1}:`, error);
              }
            }
            
            // Fallback to regular image generation if avatar editing fails or no avatar
            if (!imageBase64) {
              console.log(`Generating regular illustration for page ${i + 1}...`);
              const imageResponse = await fetch('https://toolkit.rork.com/images/generate/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  prompt: `Children's book illustration page ${i + 1} of ${expectedPages}. ${baseCharacterPrompt} SCENE: "${page.text}". Style: ${characterInfo.style}, colorful, friendly, safe for children. Theme: ${request.theme}. IMPORTANT: Show the SAME character ${request.childName} as described above. NO OTHER CHILDREN in the scene. NO TEXT OR WRITING in the image. Focus on the scene while keeping the character identical to previous pages.`,
                  size: '512x512'
                })
              });

              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                if (imageData.image && imageData.image.base64Data) {
                  imageBase64 = imageData.image.base64Data;
                  console.log(`Successfully generated regular illustration for page ${i + 1}`);
                }
              }
            }
          } catch (error) {
            console.error(`Error generating image for page ${i + 1}:`, error);
          }
          
          // Add page to array
          pages.push({
            id: `page-${i}`,
            text: page.text,
            imageBase64: imageBase64 && imageBase64.trim() !== '' && imageBase64.length > 10 ? imageBase64 : ''
          });
          
          // Update progress
          const progress = 40 + ((i + 1) / totalPages) * 45;
          setGenerationProgress(progress);
        }
        
        console.log(`Created ${pages.length} pages out of ${totalPages} expected pages`);
        console.log('Pages with images:', pages.filter(p => p.imageBase64 && p.imageBase64.length > 10).length);
        console.log('Pages without images:', pages.filter(p => !p.imageBase64 || p.imageBase64.length <= 10).length);
        
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
      console.error('Story generation failed:', error);
      setIsGenerating(false);
      setGenerationProgress(0);
      throw error;
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [storiesQuery.data, saveStories]);

  const deleteStory = useCallback(async (storyId: string) => {
    const currentStories = storiesQuery.data || [];
    const updatedStories = currentStories.filter(s => s.id !== storyId);
    await saveStories(updatedStories);
  }, [storiesQuery.data, saveStories]);

  return useMemo(() => ({
    stories: storiesQuery.data || [],
    isLoading: storiesQuery.isLoading,
    isGenerating,
    generationProgress,
    generateStory,
    deleteStory,
    clearAllStories
  }), [storiesQuery.data, storiesQuery.isLoading, isGenerating, generationProgress, generateStory, deleteStory, clearAllStories]);
});