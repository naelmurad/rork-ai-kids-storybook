import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StoryProvider } from "@/hooks/story-store";
import { AppSettingsProvider, useAppSettings } from "@/hooks/app-settings";
import OnboardingScreen from "@/components/OnboardingScreen";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();



function RootLayoutNav() {
  const { settings, updateSettings, currentLanguage } = useAppSettings();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setShowOnboarding(!settings.hasSeenOnboarding || !settings.hasSelectedLanguage);
  }, [settings.hasSeenOnboarding, settings.hasSelectedLanguage]);

  const handleOnboardingComplete = async () => {
    await updateSettings({ 
      hasSeenOnboarding: true,
      hasSelectedLanguage: true 
    });
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Force re-render when language changes
  const stackKey = `stack-${currentLanguage}`;

  return (
    <Stack key={stackKey} screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppSettingsProvider>
        <StoryProvider>
          <GestureHandlerRootView style={styles.container}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </StoryProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});