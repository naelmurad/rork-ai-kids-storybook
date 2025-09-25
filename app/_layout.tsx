import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StoryProvider } from "@/hooks/story-store";
import { AppSettingsProvider, useAppSettings } from "@/hooks/app-settings";
import { SubscriptionProvider } from "@/hooks/subscription-store";
import { AdProvider } from "@/hooks/ad-store";
import OnboardingScreen from "@/components/OnboardingScreen";
import ErrorBoundary from "@/components/ErrorBoundary";

console.log("[RootLayout] Initializing app layout");
SplashScreen.preventAutoHideAsync().catch((e) => console.warn("[RootLayout] preventAutoHide failed", e));

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { settings, updateSettings, currentLanguage, isLoading } = useAppSettings();
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading) {
      const shouldShow = !settings.hasSeenOnboarding || !settings.hasSelectedLanguage;
      console.log("[RootLayoutNav] isLoading=false, shouldShowOnboarding=", shouldShow);
      setShowOnboarding(shouldShow);
      SplashScreen.hideAsync().catch((e) => console.warn("[RootLayoutNav] hideAsync failed", e));
    } else {
      console.log("[RootLayoutNav] Waiting for settings to load...");
    }
  }, [isLoading, settings.hasSeenOnboarding, settings.hasSelectedLanguage]);

  const handleOnboardingComplete = async () => {
    await updateSettings({
      hasSeenOnboarding: true,
      hasSelectedLanguage: true,
    });
    setShowOnboarding(false);
  };

  if (isLoading) {
    console.log("[RootLayoutNav] Loading state, rendering nothing yet");
    return null;
  }

  if (showOnboarding) {
    console.log("[RootLayoutNav] Showing onboarding");
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  const stackKey = `stack-${currentLanguage}`;

  return (
    <Stack key={stackKey} screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppSettingsProvider>
        <SubscriptionProvider>
          <AdProvider>
            <StoryProvider>
              <ErrorBoundary>
                <GestureHandlerRootView style={styles.container} testID="root-gesture-container">
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </ErrorBoundary>
            </StoryProvider>
          </AdProvider>
        </SubscriptionProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});