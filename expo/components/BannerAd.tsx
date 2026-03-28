import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ExternalLink } from 'lucide-react-native';
import { useAds } from '@/hooks/ad-store';

interface BannerAdProps {
  style?: any;
  size?: 'small' | 'medium' | 'large';
}



export default function BannerAd({ style, size = 'medium' }: BannerAdProps) {
  const { canShowAd, adConfig } = useAds();
  const { width: screenWidth } = useWindowDimensions();

  if (!canShowAd) {
    return null;
  }

  const AD_SIZES = {
    small: { width: screenWidth - 40, height: 50 },
    medium: { width: screenWidth - 40, height: 100 },
    large: { width: screenWidth - 40, height: 150 },
  };

  const adSize = AD_SIZES[size];

  const handleAdPress = () => {
    console.log('Banner ad clicked');
    // In production, this would track clicks and open advertiser content
  };

  return (
    <View style={[styles.container, { ...adSize }, style]} testID="banner-ad">
      <TouchableOpacity
        style={styles.adContent}
        onPress={handleAdPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FF6B9D', '#4ECDC4']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.adInfo}>
            <Text style={styles.adLabel} testID="ad-label">Ad</Text>
            <ExternalLink size={12} color="#FFF" />
          </View>
          
          <View style={styles.adBody}>
            <Text style={styles.adTitle} testID="ad-title">
              {size === 'small' ? 'Premium Stories' : 'Unlock Premium Stories'}
            </Text>
            {size !== 'small' && (
              <Text style={styles.adDescription} testID="ad-description">
                Get unlimited access to magical stories
              </Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
      
      {adConfig.testMode && (
        <View style={styles.testBadge}>
          <Text style={styles.testText}>TEST</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adContent: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  adInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  adLabel: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adBody: {
    flex: 1,
    justifyContent: 'center',
  },
  adTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
  },
  adDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  testBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF4444',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  testText: {
    fontSize: 8,
    color: '#FFF',
    fontWeight: 'bold',
  },
});