import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Lock, ChevronRight, X, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSettings } from '@/hooks/app-settings';
import { useStories } from '@/hooks/story-store';


interface BadgeDef {
  id: string;
  titleKey: string;
  descriptionKey: string;
  requiredStories: number;
  icon: string;
}

const BADGE_DEFS: BadgeDef[] = [
  // Story Creation Badges
  { id: 'first_story', titleKey: 'First Story', descriptionKey: 'Complete your first story', requiredStories: 1, icon: '🌟' },
  { id: 'story_5', titleKey: 'Story Explorer', descriptionKey: 'Create 5 stories', requiredStories: 5, icon: '🗺️' },
  { id: 'story_10', titleKey: 'Story Hero', descriptionKey: 'Create 10 stories', requiredStories: 10, icon: '🦸' },
  { id: 'story_25', titleKey: 'Story Master', descriptionKey: 'Create 25 stories', requiredStories: 25, icon: '👑' },
  { id: 'story_50', titleKey: 'Story Legend', descriptionKey: 'Create 50 stories', requiredStories: 50, icon: '🏆' },
  { id: 'story_100', titleKey: 'Story Wizard', descriptionKey: 'Create 100 stories', requiredStories: 100, icon: '🧙‍♂️' },
  
  // Reading Streak Badges
  { id: 'streak_3', titleKey: '3-Day Streak', descriptionKey: 'Read 3 days in a row', requiredStories: 3, icon: '🔥' },
  { id: 'streak_7', titleKey: 'Weekly Streak', descriptionKey: 'Read 7 days in a row', requiredStories: 7, icon: '📅' },
  { id: 'streak_14', titleKey: 'Two Week Warrior', descriptionKey: 'Read 14 days in a row', requiredStories: 14, icon: '⚔️' },
  { id: 'streak_30', titleKey: 'Monthly Master', descriptionKey: 'Read 30 days in a row', requiredStories: 30, icon: '🌙' },
  { id: 'streak_60', titleKey: 'Dedication Diamond', descriptionKey: 'Read 60 days in a row', requiredStories: 60, icon: '💎' },
  { id: 'streak_100', titleKey: 'Century Champion', descriptionKey: 'Read 100 days in a row', requiredStories: 100, icon: '🏅' },
  
  // Theme Badges
  { id: 'adventure_lover', titleKey: 'Adventure Lover', descriptionKey: 'Create 5 adventure stories', requiredStories: 5, icon: '🏔️' },
  { id: 'fairy_tale_fan', titleKey: 'Fairy Tale Fan', descriptionKey: 'Create 5 fairy tale stories', requiredStories: 5, icon: '🧚‍♀️' },
  { id: 'space_explorer', titleKey: 'Space Explorer', descriptionKey: 'Create 5 space stories', requiredStories: 5, icon: '🚀' },
  { id: 'animal_friend', titleKey: 'Animal Friend', descriptionKey: 'Create 5 animal stories', requiredStories: 5, icon: '🐾' },
  { id: 'mystery_solver', titleKey: 'Mystery Solver', descriptionKey: 'Create 5 mystery stories', requiredStories: 5, icon: '🔍' },
  { id: 'fantasy_dreamer', titleKey: 'Fantasy Dreamer', descriptionKey: 'Create 5 fantasy stories', requiredStories: 5, icon: '🐉' },
  
  // Special Achievement Badges
  { id: 'early_bird', titleKey: 'Early Bird', descriptionKey: 'Create a story before 8 AM', requiredStories: 1, icon: '🌅' },
  { id: 'night_owl', titleKey: 'Night Owl', descriptionKey: 'Create a story after 10 PM', requiredStories: 1, icon: '🦉' },
  { id: 'weekend_warrior', titleKey: 'Weekend Warrior', descriptionKey: 'Create stories on both weekend days', requiredStories: 2, icon: '🎯' },
  { id: 'speed_reader', titleKey: 'Speed Reader', descriptionKey: 'Read a story in under 5 minutes', requiredStories: 1, icon: '⚡' },
  { id: 'bookworm', titleKey: 'Bookworm', descriptionKey: 'Read for 30 minutes straight', requiredStories: 1, icon: '🐛' },
  { id: 'creative_genius', titleKey: 'Creative Genius', descriptionKey: 'Use custom themes 10 times', requiredStories: 10, icon: '🎨' },
  
  // Language Badges
  { id: 'polyglot', titleKey: 'Polyglot', descriptionKey: 'Create stories in 3 languages', requiredStories: 3, icon: '🌍' },
  { id: 'translator', titleKey: 'Translator', descriptionKey: 'Create stories in 5 languages', requiredStories: 5, icon: '📚' },
  { id: 'world_citizen', titleKey: 'World Citizen', descriptionKey: 'Create stories in all languages', requiredStories: 7, icon: '🌐' },
  
  // Page Count Badges
  { id: 'short_sweet', titleKey: 'Short & Sweet', descriptionKey: 'Create 10 stories with 3 pages', requiredStories: 10, icon: '📄' },
  { id: 'perfect_length', titleKey: 'Perfect Length', descriptionKey: 'Create 10 stories with 5 pages', requiredStories: 10, icon: '📖' },
  { id: 'epic_tale', titleKey: 'Epic Tale', descriptionKey: 'Create a story with 12 pages', requiredStories: 1, icon: '📚' },
  { id: 'novel_writer', titleKey: 'Novel Writer', descriptionKey: 'Create 5 stories with 10+ pages', requiredStories: 5, icon: '✍️' },
  
  // Character Badges
  { id: 'boy_stories', titleKey: 'Boy Adventures', descriptionKey: 'Create 10 stories with boy characters', requiredStories: 10, icon: '👦' },
  { id: 'girl_stories', titleKey: 'Girl Adventures', descriptionKey: 'Create 10 stories with girl characters', requiredStories: 10, icon: '👧' },
  { id: 'balanced_storyteller', titleKey: 'Balanced Storyteller', descriptionKey: 'Create equal boy and girl stories', requiredStories: 20, icon: '⚖️' },
  
  // Time-based Badges
  { id: 'morning_magic', titleKey: 'Morning Magic', descriptionKey: 'Create 5 stories in the morning', requiredStories: 5, icon: '☀️' },
  { id: 'afternoon_adventure', titleKey: 'Afternoon Adventure', descriptionKey: 'Create 5 stories in the afternoon', requiredStories: 5, icon: '🌤️' },
  { id: 'evening_enchantment', titleKey: 'Evening Enchantment', descriptionKey: 'Create 5 stories in the evening', requiredStories: 5, icon: '🌆' },
  
  // Seasonal Badges
  { id: 'spring_storyteller', titleKey: 'Spring Storyteller', descriptionKey: 'Create 10 stories in spring', requiredStories: 10, icon: '🌸' },
  { id: 'summer_scribe', titleKey: 'Summer Scribe', descriptionKey: 'Create 10 stories in summer', requiredStories: 10, icon: '☀️' },
  { id: 'autumn_author', titleKey: 'Autumn Author', descriptionKey: 'Create 10 stories in autumn', requiredStories: 10, icon: '🍂' },
  { id: 'winter_writer', titleKey: 'Winter Writer', descriptionKey: 'Create 10 stories in winter', requiredStories: 10, icon: '❄️' },
  
  // Milestone Badges
  { id: 'first_week', titleKey: 'First Week', descriptionKey: 'Use the app for 7 days', requiredStories: 1, icon: '📅' },
  { id: 'first_month', titleKey: 'First Month', descriptionKey: 'Use the app for 30 days', requiredStories: 1, icon: '🗓️' },
  { id: 'loyal_user', titleKey: 'Loyal User', descriptionKey: 'Use the app for 100 days', requiredStories: 1, icon: '💝' },
  { id: 'veteran', titleKey: 'Veteran', descriptionKey: 'Use the app for 365 days', requiredStories: 1, icon: '🎖️' },
  
  // Social Badges
  { id: 'family_time', titleKey: 'Family Time', descriptionKey: 'Read stories together 10 times', requiredStories: 10, icon: '👨‍👩‍👧‍👦' },
  { id: 'bedtime_buddy', titleKey: 'Bedtime Buddy', descriptionKey: 'Read stories at bedtime 20 times', requiredStories: 20, icon: '🛏️' },
  
  // Premium Badges
  { id: 'premium_member', titleKey: 'Premium Member', descriptionKey: 'Upgrade to premium', requiredStories: 1, icon: '👑' },
  { id: 'premium_veteran', titleKey: 'Premium Veteran', descriptionKey: 'Premium member for 30 days', requiredStories: 1, icon: '💎' },
  
  // Special Collection Badges
  { id: 'collector', titleKey: 'Collector', descriptionKey: 'Save 20 stories to library', requiredStories: 20, icon: '📚' },
  { id: 'curator', titleKey: 'Curator', descriptionKey: 'Save 50 stories to library', requiredStories: 50, icon: '🏛️' },
  { id: 'archivist', titleKey: 'Archivist', descriptionKey: 'Save 100 stories to library', requiredStories: 100, icon: '📜' },
  
  // Fun Achievement Badges
  { id: 'lucky_seven', titleKey: 'Lucky Seven', descriptionKey: 'Create your 7th story', requiredStories: 7, icon: '🍀' },
  { id: 'baker_dozen', titleKey: 'Baker\'s Dozen', descriptionKey: 'Create your 13th story', requiredStories: 13, icon: '🥖' },
  { id: 'sweet_sixteen', titleKey: 'Sweet Sixteen', descriptionKey: 'Create your 16th story', requiredStories: 16, icon: '🎂' },
  { id: 'coming_of_age', titleKey: 'Coming of Age', descriptionKey: 'Create your 21st story', requiredStories: 21, icon: '🎉' },
  
  // Master Badges
  { id: 'story_sage', titleKey: 'Story Sage', descriptionKey: 'Unlock 25 other badges', requiredStories: 25, icon: '🧙‍♀️' },
  { id: 'badge_hunter', titleKey: 'Badge Hunter', descriptionKey: 'Unlock 40 other badges', requiredStories: 40, icon: '🏹' },
  { id: 'achievement_master', titleKey: 'Achievement Master', descriptionKey: 'Unlock all badges', requiredStories: 60, icon: '🏆' },
];

export default function BadgesScreen() {
  const { t, settings } = useAppSettings();
  const { stories } = useStories();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const completedCount = stories.length;
  const streak = settings.currentStreak;
  const [selectedBadge, setSelectedBadge] = useState<BadgeDef | null>(null);
  const [showModal, setShowModal] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;

  const items = useMemo(() => {
    return BADGE_DEFS.map(def => {
      const progressRef = def.id.startsWith('streak') ? streak : completedCount;
      const earned = progressRef >= def.requiredStories;
      return { ...def, earned };
    }).sort((a, b) => Number(b.earned) - Number(a.earned) || a.requiredStories - b.requiredStories);
  }, [completedCount, streak]);

  return (
    <View style={styles.container} testID="badges-screen">
      <LinearGradient colors={["#667eea", "#764ba2"]} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerContent}>
          <Award size={24} color="#FFF" />
          <Text style={styles.headerTitle}>{t('badges')}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.list} testID="badges-list">
        <Text style={styles.sectionTitle}>{t('earnedBadges')}</Text>
        <View style={styles.grid}>
          {items.filter(i => i.earned).length === 0 ? (
            <Text style={styles.emptyText}>No badges yet. Finish stories to unlock!</Text>
          ) : (
            items.filter(i => i.earned).map(item => (
              <BadgeCard key={item.id} item={item} earned onPress={() => openBadgeModal(item)} />
            ))
          )}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>{t('lockedBadges')}</Text>
        <View style={styles.grid}>
          {items.filter(i => !i.earned).map(item => (
            <BadgeCard key={item.id} item={item} earned={false} />
          ))}
        </View>
      </ScrollView>

      <BadgeModal 
        badge={selectedBadge} 
        visible={showModal} 
        onClose={closeBadgeModal}
        scaleAnim={scaleAnim}
        sparkleAnims={sparkleAnims}
        screenWidth={screenWidth}
      />
    </View>
  );

  function openBadgeModal(badge: BadgeDef) {
    setSelectedBadge(badge);
    setShowModal(true);
    
    // Start animations
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(100, sparkleAnims.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      ))
    ]).start();
  }

  function closeBadgeModal() {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      ...sparkleAnims.map(anim => 
        Animated.timing(anim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      )
    ]).start(() => {
      setShowModal(false);
      setSelectedBadge(null);
    });
  }
}

function BadgeCard({ item, earned, onPress }: { 
  item: { id: string; titleKey: string; descriptionKey: string; requiredStories: number; icon: string; }, 
  earned: boolean,
  onPress?: () => void 
}) {
  const CardComponent = earned ? TouchableOpacity : View;
  
  return (
    <CardComponent 
      style={[styles.card, !earned && styles.cardLocked]} 
      testID={`badge-${item.id}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.iconEmoji}>{item.icon}</Text>
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{item.titleKey}</Text>
        <Text style={styles.cardDesc}>{item.descriptionKey}</Text>
      </View>
      {earned ? (
        <ChevronRight size={18} color="#667eea" />
      ) : (
        <View style={styles.lockWrap}>
          <Lock size={16} color="#999" />
          <Text style={styles.lockText}>x{item.requiredStories}</Text>
        </View>
      )}
    </CardComponent>
  );
}

function BadgeModal({ badge, visible, onClose, scaleAnim, sparkleAnims, screenWidth }: {
  badge: BadgeDef | null,
  visible: boolean,
  onClose: () => void,
  scaleAnim: Animated.Value,
  sparkleAnims: Animated.Value[],
  screenWidth: number
}) {
  if (!badge) return null;

  const sparklePositions = [
    { top: '20%', left: '15%' },
    { top: '25%', right: '20%' },
    { top: '45%', left: '10%' },
    { top: '50%', right: '15%' },
    { top: '70%', left: '20%' },
    { top: '75%', right: '25%' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View style={[styles.modalContent, { maxWidth: screenWidth * 0.85 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#666" />
          </TouchableOpacity>
          
          <Animated.View 
            style={[
              styles.badgeDisplay,
              {
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.modalIconContainer}>
              <Text style={styles.modalIconEmoji}>{badge.icon}</Text>
            </View>
            <Text style={styles.modalTitle}>{badge.titleKey}</Text>
            <Text style={styles.modalDescription}>{badge.descriptionKey}</Text>
            
            <View style={styles.congratsContainer}>
              <Award size={20} color="#FFD700" />
              <Text style={styles.congratsText}>Congratulations!</Text>
              <Award size={20} color="#FFD700" />
            </View>
          </Animated.View>
          
          {/* Sparkle animations */}
          {sparkleAnims.map((anim, index) => (
            <Animated.View
              key={`sparkle-${index}`}
              style={[
                styles.sparkle,
                sparklePositions[index],
                {
                  opacity: anim,
                  transform: [
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 1.2, 1]
                      })
                    },
                    {
                      rotate: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      })
                    }
                  ]
                }
              ]}
            >
              <Star size={16} color="#FFD700" fill="#FFD700" />
            </Animated.View>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold' },
  list: { padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 8, textAlign: 'center' },
  grid: { gap: 8 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, padding: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  cardLocked: { opacity: 0.6 },
  iconContainer: { width: 44, height: 44, borderRadius: 8, marginRight: 12, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' },
  iconEmoji: { fontSize: 24 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
  cardDesc: { fontSize: 12, color: '#666', marginTop: 2 },
  emptyText: { color: '#666', fontSize: 12, textAlign: 'center' },
  lockWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lockText: { color: '#999', fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  badgeDisplay: {
    alignItems: 'center',
    paddingTop: 20,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIconEmoji: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  congratsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  congratsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B8860B',
  },
  sparkle: {
    position: 'absolute',
  },
});
