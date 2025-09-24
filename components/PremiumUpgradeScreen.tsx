import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Crown, 
  X, 
  Check, 
  Sparkles,
  BookOpen,
  Download
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PremiumUpgradeScreenProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const premiumFeatures = [
  {
    icon: BookOpen,
    title: 'Unlimited Stories',
    description: 'Create as many stories as you want, every day',
    color: '#4CAF50',
  },
  {
    icon: Sparkles,
    title: 'Extended Stories',
    description: 'Up to 12 pages per story instead of 5',
    color: '#FF6B9D',
  },
  {
    icon: Download,
    title: 'PDF Export',
    description: 'Save and share stories as beautiful PDFs',
    color: '#2196F3',
  },
];

export default function PremiumUpgradeScreen({ 
  visible, 
  onClose, 
  onUpgrade 
}: PremiumUpgradeScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#FFD700', '#FFA000']}
          style={[styles.gradient, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.crownContainer}>
              <Crown size={32} color="#333" />
            </View>
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.subtitle}>
              Unlock unlimited magical stories
            </Text>

            <View style={styles.pricingContainer}>
              <View style={styles.pricingCard}>
                <Text style={styles.pricingTitle}>Premium Weekly</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>$1.50</Text>
                  <Text style={styles.pricePeriod}>/week</Text>
                </View>
                <Text style={styles.pricingDescription}>
                  Cancel anytime
                </Text>
              </View>
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What you get:</Text>
              {premiumFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <View key={`${feature.title}-${index}`} style={styles.featureItem}>
                    <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                      <IconComponent size={20} color="#FFF" />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                    <Check size={20} color="#4CAF50" />
                  </View>
                );
              })}
            </View>

            <View style={styles.comparisonContainer}>
              <Text style={styles.comparisonTitle}>Free vs Premium</Text>
              <View style={styles.comparisonTable}>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonFeature}>Weekly Stories</Text>
                  <Text style={styles.comparisonFree}>2</Text>
                  <Text style={styles.comparisonPremium}>Unlimited</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonFeature}>Pages per Story</Text>
                  <Text style={styles.comparisonFree}>5</Text>
                  <Text style={styles.comparisonPremium}>12</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonFeature}>PDF Export</Text>
                  <Text style={styles.comparisonFree}>✗</Text>
                  <Text style={styles.comparisonPremium}>✓</Text>
                </View>
                <View style={styles.comparisonRow}>
                  <Text style={styles.comparisonFeature}>Ads</Text>
                  <Text style={styles.comparisonFree}>Yes</Text>
                  <Text style={styles.comparisonPremium}>No</Text>
                </View>

              </View>
            </View>
          </ScrollView>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={onUpgrade}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4CAF50', '#45A049']}
                style={styles.upgradeButtonGradient}
              >
                <Crown size={20} color="#FFF" />
                <Text style={styles.upgradeButtonText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                  Start Premium
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.laterButton}
              onPress={onClose}
            >
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crownContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: -16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  pricingContainer: {
    marginBottom: 32,
  },
  pricingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  pricingTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  pricePeriod: {
    fontSize: 9,
    color: '#666',
    marginLeft: 4,
  },
  pricingDescription: {
    fontSize: 6,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 7,
    color: '#666',
  },
  comparisonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
  },
  comparisonTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  comparisonTable: {
    gap: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  comparisonFeature: {
    flex: 1,
    fontSize: 7,
    color: '#333',
    fontWeight: '500',
  },
  comparisonFree: {
    width: 60,
    fontSize: 7,
    color: '#666',
    textAlign: 'center',
  },
  comparisonPremium: {
    width: 60,
    fontSize: 7,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  upgradeButton: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFF',
    flexShrink: 1,
    maxWidth: 220,
  },
  laterButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  laterButtonText: {
    fontSize: 8,
    color: '#666',
    fontWeight: '600',
  },
});