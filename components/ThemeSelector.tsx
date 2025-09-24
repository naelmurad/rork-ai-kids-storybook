import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Sparkles, Sword, Crown, Rocket, TreePine, Waves, Edit3, Castle, Zap, Heart, Star, Sun, Moon, Flower, Fish, Car, Plane, Train, Ship, Music, Palette, Camera, Book, Gift, Cake, BanIcon, Snowflake, Leaf, Mountain, Bath, Cat } from 'lucide-react-native';
import { useAppSettings } from '@/hooks/app-settings';

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeSelect: (theme: string) => void;
  customTheme: string;
  onCustomThemeChange: (theme: string) => void;
  hasError?: boolean;
}

// All available themes for randomization
const ALL_THEMES = [
  { id: 'adventure', icon: Sword },
  { id: 'princess', icon: Crown },
  { id: 'space', icon: Rocket },
  { id: 'forest', icon: TreePine },
  { id: 'ocean', icon: Waves },
  { id: 'magic', icon: Sparkles },
  { id: 'castle', icon: Castle },
  { id: 'superhero', icon: Zap },
  { id: 'friendship', icon: Heart },
  { id: 'dreams', icon: Star },
  { id: 'sunny_day', icon: Sun },
  { id: 'moonlight', icon: Moon },
  { id: 'garden', icon: Flower },
  { id: 'underwater', icon: Fish },
  { id: 'racing', icon: Car },
  { id: 'flying', icon: Plane },
  { id: 'train_journey', icon: Train },
  { id: 'pirate_ship', icon: Ship },
  { id: 'musical', icon: Music },
  { id: 'artistic', icon: Palette },
  { id: 'photography', icon: Camera },
  { id: 'library', icon: Book },
  { id: 'birthday', icon: Gift },
  { id: 'party', icon: Cake },
  { id: 'carnival', icon: BanIcon },
  { id: 'winter', icon: Snowflake },
  { id: 'autumn', icon: Leaf },
  { id: 'mountain', icon: Mountain },
  { id: 'beach', icon: Bath },
  { id: 'city', icon: Cat },
];

// Function to get random themes
const getRandomThemes = (count: number = 6) => {
  const shuffled = [...ALL_THEMES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function ThemeSelector({ selectedTheme, onThemeSelect, customTheme, onCustomThemeChange, hasError }: ThemeSelectorProps) {
  const { t, currentLanguage } = useAppSettings();
  
  // Generate random themes on each render (new story creation)
  const randomThemes = useMemo(() => getRandomThemes(6), []);
  
  // Combine random themes with custom option
  const displayThemes = [...randomThemes, { id: 'custom', icon: Edit3 }];
  
  return (
    <View style={styles.container}>
      <Text style={[styles.label, currentLanguage === 'ar' && styles.rtlText, hasError && styles.labelError]}>{t('chooseTheme')}</Text>
      <View style={styles.themesGrid}>
        {displayThemes.map((theme) => {
          const IconComponent = theme.icon;
          const isSelected = selectedTheme === theme.id;
          const isCustom = theme.id === 'custom';
          const themeName = t(`theme_${theme.id}` as any);
          
          return (
            <TouchableOpacity
              key={theme.id}
              style={[
                isCustom ? styles.customThemeButton : styles.themeButton,
                isSelected && (isCustom ? styles.customThemeButtonSelected : styles.themeButtonSelected)
              ]}
              onPress={() => onThemeSelect(theme.id)}
            >
              <IconComponent 
                size={24} 
                color={isSelected ? '#FFF' : (isCustom ? '#95A5A6' : '#667eea')} 
              />
              <Text style={[
                styles.themeText,
                isSelected && styles.themeTextSelected,
                currentLanguage === 'ar' && styles.rtlText
              ]}>
                {themeName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {selectedTheme === 'custom' && (
        <View style={styles.customThemeContainer}>
          <Text style={[styles.customLabel, currentLanguage === 'ar' && styles.rtlText]}>
            {t('describeTheme')}
          </Text>
          <TextInput
            style={[
              styles.customInput, 
              currentLanguage === 'ar' && styles.rtlInput,
              hasError && styles.customInputError
            ]}
            value={customTheme}
            onChangeText={onCustomThemeChange}
            placeholder={t('customThemePlaceholder')}
            placeholderTextColor={hasError ? '#FF6B6B' : '#999'}
            multiline
          />
        </View>
      )}
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
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 2,
    borderColor: '#667eea',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  themeButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  customThemeButton: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: '#95A5A6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  customThemeButtonSelected: {
    backgroundColor: '#95A5A6',
    borderColor: '#95A5A6',
  },
  themeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  themeTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  customThemeContainer: {
    marginTop: 16,
  },
  customLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  customInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  rtlInput: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  labelError: {
    color: '#FF6B6B',
  },
  customInputError: {
    borderColor: '#FF6B6B',
    borderWidth: 2,
    backgroundColor: '#FFF5F5',
  },
});