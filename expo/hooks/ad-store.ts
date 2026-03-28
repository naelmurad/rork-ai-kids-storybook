import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { useSubscription } from './subscription-store';

interface AdState {
  isAdLoaded: boolean;
  isShowingAd: boolean;
  adError: string | null;
  canShowAd: boolean;
}

interface AdConfig {
  interstitialAdId: string;
  bannerAdId: string;
  rewardedAdId: string;
  testMode: boolean;
}

const AD_CONFIG: AdConfig = {
  interstitialAdId: 'ca-app-pub-3940256099942544/1033173712', // Test ID
  bannerAdId: 'ca-app-pub-3940256099942544/6300978111', // Test ID
  rewardedAdId: 'ca-app-pub-3940256099942544/5224354917', // Test ID
  testMode: true, // Set to false in production
};

export const [AdProvider, useAds] = createContextHook(() => {
  const { isPremium } = useSubscription();
  const [adState, setAdState] = useState<AdState>({
    isAdLoaded: false,
    isShowingAd: false,
    adError: null,
    canShowAd: !isPremium,
  });

  // Update ad availability based on subscription status
  useEffect(() => {
    setAdState(prev => ({
      ...prev,
      canShowAd: !isPremium,
    }));
  }, [isPremium]);

  const loadInterstitialAd = useCallback(async () => {
    if (!adState.canShowAd) return;
    
    try {
      setAdState(prev => ({ ...prev, isAdLoaded: false, adError: null }));
      
      // Simulate ad loading (replace with real ad loading in production)
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));
      
      setAdState(prev => ({ ...prev, isAdLoaded: true }));
      console.log('Interstitial ad loaded');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load ad';
      setAdState(prev => ({ 
        ...prev, 
        isAdLoaded: false, 
        adError: errorMessage 
      }));
      console.error('Error loading interstitial ad:', error);
    }
  }, [adState.canShowAd]);

  const showInterstitialAd = useCallback(async (): Promise<boolean> => {
    if (!adState.canShowAd || !adState.isAdLoaded) {
      console.log('Cannot show ad: premium user or ad not loaded');
      return false;
    }

    try {
      setAdState(prev => ({ ...prev, isShowingAd: true }));
      
      // Simulate ad showing (replace with real ad showing in production)
      await new Promise<void>(resolve => setTimeout(() => resolve(), 3000));
      
      setAdState(prev => ({ 
        ...prev, 
        isShowingAd: false, 
        isAdLoaded: false 
      }));
      
      console.log('Interstitial ad shown');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to show ad';
      setAdState(prev => ({ 
        ...prev, 
        isShowingAd: false, 
        adError: errorMessage 
      }));
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  }, [adState.canShowAd, adState.isAdLoaded]);

  const showRewardedAd = useCallback(async (): Promise<{ success: boolean; rewarded: boolean }> => {
    if (!adState.canShowAd) {
      console.log('Cannot show rewarded ad: premium user');
      return { success: false, rewarded: false };
    }

    try {
      setAdState(prev => ({ ...prev, isShowingAd: true }));
      
      // Simulate rewarded ad showing (replace with real ad showing in production)
      await new Promise<void>(resolve => setTimeout(() => resolve(), 5000));
      
      setAdState(prev => ({ ...prev, isShowingAd: false }));
      
      console.log('Rewarded ad shown and completed');
      return { success: true, rewarded: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to show rewarded ad';
      setAdState(prev => ({ 
        ...prev, 
        isShowingAd: false, 
        adError: errorMessage 
      }));
      console.error('Error showing rewarded ad:', error);
      return { success: false, rewarded: false };
    }
  }, [adState.canShowAd]);

  const shouldShowAd = useCallback((frequency: number = 3): boolean => {
    if (!adState.canShowAd) return false;
    
    // Simple frequency logic - show ad every N actions
    const actionCount = Math.floor(Math.random() * 10); // Replace with real action tracking
    return actionCount % frequency === 0;
  }, [adState.canShowAd]);

  return useMemo(() => ({
    ...adState,
    loadInterstitialAd,
    showInterstitialAd,
    showRewardedAd,
    shouldShowAd,
    adConfig: AD_CONFIG,
  }), [
    adState,
    loadInterstitialAd,
    showInterstitialAd,
    showRewardedAd,
    shouldShowAd,
  ]);
});