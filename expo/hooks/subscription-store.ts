import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import * as WebBrowser from 'expo-web-browser';

interface SubscriptionState {
  isPremium: boolean;
  subscriptionType: 'free' | 'weekly' | 'monthly' | 'yearly';
  expiresAt: Date | null;
  isLoading: boolean;
}

const SUBSCRIPTION_STORAGE_KEY = 'subscription_state';
const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/your-checkout-url'; // Replace with your Stripe checkout URL

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    isPremium: false,
    subscriptionType: 'free',
    expiresAt: null,
    isLoading: true,
  });

  // Load subscription state from storage
  useEffect(() => {
    loadSubscriptionState();
  }, []);

  const loadSubscriptionState = async () => {
    try {
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const expiresAt = parsed.expiresAt ? new Date(parsed.expiresAt) : null;
        
        // Check if subscription is still valid
        const isExpired = expiresAt && expiresAt < new Date();
        
        setSubscriptionState({
          ...parsed,
          expiresAt,
          isPremium: !isExpired && parsed.isPremium,
          subscriptionType: isExpired ? 'free' : parsed.subscriptionType,
          isLoading: false,
        });
      } else {
        setSubscriptionState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading subscription state:', error);
      setSubscriptionState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const saveSubscriptionState = useCallback(async (state: SubscriptionState) => {
    if (!state || typeof state !== 'object') return;
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving subscription state:', error);
    }
  }, []);

  const startSubscription = useCallback(async (type: 'weekly' | 'monthly' | 'yearly') => {
    if (!type || !['weekly', 'monthly', 'yearly'].includes(type)) return;
    try {
      // Open Stripe checkout in browser
      const result = await WebBrowser.openBrowserAsync(
        `${STRIPE_CHECKOUT_URL}?subscription_type=${type}&user_id=${Date.now()}`
      );
      
      if (result.type === 'dismiss') {
        // User closed browser, check if they completed purchase
        // In a real app, you'd verify this with your backend
        console.log('User closed checkout');
      }
    } catch (error) {
      console.error('Error opening checkout:', error);
    }
  }, []);

  // Mock function - in real app, this would be called by your backend webhook
  const activateSubscription = useCallback(async (type: 'weekly' | 'monthly' | 'yearly') => {
    if (!type || !['weekly', 'monthly', 'yearly'].includes(type)) return;
    const now = new Date();
    const expiresAt = new Date(now);
    
    switch (type) {
      case 'weekly':
        expiresAt.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        expiresAt.setMonth(now.getMonth() + 1);
        break;
      case 'yearly':
        expiresAt.setFullYear(now.getFullYear() + 1);
        break;
    }

    const newState: SubscriptionState = {
      isPremium: true,
      subscriptionType: type,
      expiresAt,
      isLoading: false,
    };

    setSubscriptionState(newState);
    await saveSubscriptionState(newState);
  }, [saveSubscriptionState]);

  const cancelSubscription = useCallback(async () => {
    const newState: SubscriptionState = {
      isPremium: false,
      subscriptionType: 'free',
      expiresAt: null,
      isLoading: false,
    };

    setSubscriptionState(newState);
    await saveSubscriptionState(newState);
  }, [saveSubscriptionState]);

  // For testing purposes - remove in production
  const mockPurchase = useCallback(async () => {
    await activateSubscription('weekly');
  }, [activateSubscription]);

  const refreshSubscription = useCallback(() => {
    loadSubscriptionState();
  }, []);

  return useMemo(() => ({
    ...subscriptionState,
    startSubscription,
    activateSubscription,
    cancelSubscription,
    mockPurchase, // Remove in production
    refreshSubscription,
  }), [subscriptionState, startSubscription, activateSubscription, cancelSubscription, mockPurchase, refreshSubscription]);
});