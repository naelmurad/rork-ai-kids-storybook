import { Tabs } from "expo-router";
import { BookOpen, Library, Settings, Award } from "lucide-react-native";
import React from "react";
import { useAppSettings } from '@/hooks/app-settings';

export default function TabLayout() {
  const { currentLanguage, lastSelectedGender, t } = useAppSettings();

  // Gender-based colors
  const getGenderColors = (gender: 'boy' | 'girl') => {
    return gender === 'boy' 
      ? { primary: '#4A90E2', secondary: '#357ABD' }
      : { primary: '#FF69B4', secondary: '#E91E63' };
  };
  
  const currentGenderColors = getGenderColors(lastSelectedGender);
  const tabKey = `tabs-${currentLanguage}-${lastSelectedGender}`;

  return (
    <Tabs
      key={tabKey}
      screenOptions={{
        tabBarActiveTintColor: currentGenderColors.primary,
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('stories'),
          headerTitle: t('stories'),
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="badges"
        options={{
          title: t('badges'),
          headerTitle: t('badges'),
          tabBarIcon: ({ color, size }) => <Award size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: t('library'),
          headerTitle: t('library'),
          tabBarIcon: ({ color, size }) => <Library size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          headerTitle: t('settings'),
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}



