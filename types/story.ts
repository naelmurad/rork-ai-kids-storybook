export interface Story {
  id: string;
  title: string;
  childName: string;
  childAge: number;
  theme: string;
  language: 'en' | 'es' | 'fr' | 'it' | 'de' | 'zh' | 'ar';
  pages: StoryPage[];
  createdAt: string;
  profileId?: string;
  includeIllustrations?: boolean;
  gender?: 'boy' | 'girl';
}

export interface StoryPage {
  id: `page-${number}`;
  text: string;
  imageUrl?: string;
  imageBase64?: string;
}

export interface StoryGenerationRequest {
  childName: string;
  childAge: number;
  theme: string;
  language: 'en' | 'es' | 'fr' | 'it' | 'de' | 'zh' | 'ar';
  profileId?: string;
  pageCount?: number;
  includeIllustrations?: boolean;
  gender?: 'boy' | 'girl';
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  avatar?: string;
  createdAt: string;
}

export interface AppSettings {
  isPremium: boolean;
  dailyStoriesUsed: number;
  weeklyStoriesUsed?: number;
  lastUsageDate: string;
  lastWeeklyReset?: string;
  currentStreak: number;
  longestStreak: number;
  profiles: UserProfile[];
  selectedProfileId?: string;
  hasSeenOnboarding: boolean;
  hasSelectedLanguage?: boolean;
  language: 'en' | 'es' | 'fr' | 'it' | 'de' | 'zh' | 'ar';
  lastSelectedGender?: 'boy' | 'girl';
}

export interface UsageLimits {
  dailyStories: number;
  weeklyStories: number;
  maxPages: number;
  hasAds: boolean;
  canExportPDF: boolean;
  multiLanguage: boolean;
}

export const STORY_THEMES = [
  { id: 'adventure', name: 'Adventure', emoji: '🗺️' },
  { id: 'princess', name: 'Princess', emoji: '👸' },
  { id: 'animals', name: 'Animals', emoji: '🦁' },
  { id: 'space', name: 'Space', emoji: '🚀' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊' },
  { id: 'forest', name: 'Forest', emoji: '🌲' },
  { id: 'desert', name: 'Desert', emoji: '🏜️' },
  { id: 'city', name: 'City', emoji: '🏙️' },
];