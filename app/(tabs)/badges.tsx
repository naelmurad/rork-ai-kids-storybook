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
  // Story Creation Milestones
  { id: 'first_story', titleKey: 'First Story', descriptionKey: 'Complete your first story', requiredStories: 1, icon: '🌟' },
  { id: 'story_explorer', titleKey: 'Story Explorer', descriptionKey: 'Create 5 stories', requiredStories: 5, icon: '🗺️' },
  { id: 'story_master', titleKey: 'Story Master', descriptionKey: 'Create 15 stories', requiredStories: 15, icon: '👑' },
  { id: 'story_legend', titleKey: 'Story Legend', descriptionKey: 'Create 30 stories', requiredStories: 30, icon: '🏆' },
  
  // Reading Engagement
  { id: 'reading_streak', titleKey: 'Reading Streak', descriptionKey: 'Read stories 7 days in a row', requiredStories: 7, icon: '🔥' },
  { id: 'dedicated_reader', titleKey: 'Dedicated Reader', descriptionKey: 'Read stories 30 days in a row', requiredStories: 30, icon: '📚' },
  
  // Creative Themes
  { id: 'adventure_lover', titleKey: 'Adventure Lover', descriptionKey: 'Create 3 adventure stories', requiredStories: 3, icon: '🏔️' },
  { id: 'fantasy_dreamer', titleKey: 'Fantasy Dreamer', descriptionKey: 'Create 3 fantasy stories', requiredStories: 3, icon: '🐉' },
  { id: 'space_explorer', titleKey: 'Space Explorer', descriptionKey: 'Create 3 space stories', requiredStories: 3, icon: '🚀' },
  
  // Special Achievements
  { id: 'illustration_artist', titleKey: 'Illustration Artist', descriptionKey: 'Create 5 stories with illustrations', requiredStories: 5, icon: '🎨' },
  { id: 'polyglot', titleKey: 'Polyglot', descriptionKey: 'Create stories in 3 different languages', requiredStories: 3, icon: '🌍' },
  { id: 'epic_storyteller', titleKey: 'Epic Storyteller', descriptionKey: 'Create a story with 10+ pages', requiredStories: 1, icon: '📖' },
  
  // Time-based
  { id: 'early_bird', titleKey: 'Early Bird', descriptionKey: 'Create a story before 8 AM', requiredStories: 1, icon: '🌅' },
  { id: 'night_owl', titleKey: 'Night Owl', descriptionKey: 'Create a story after 10 PM', requiredStories: 1, icon: '🦉' },
  
  // Ultimate Achievement
  { id: 'master_storyteller', titleKey: 'Master Storyteller', descriptionKey: 'Unlock 10 other badges', requiredStories: 10, icon: '🧙‍♂️' },
];

type LocalizedBadgeTexts = Record<string, { title: string; description: string }>;

const BADGE_I18N: Record<string, LocalizedBadgeTexts> = {
  ar: {
    first_story: { title: 'أول قصة', description: 'أكمل أول قصة لك' },
    story_explorer: { title: 'مستكشف القصص', description: 'أنشئ 5 قصص' },
    story_master: { title: 'سيد القصص', description: 'أنشئ 15 قصة' },
    story_legend: { title: 'أسطورة القصص', description: 'أنشئ 30 قصة' },
    
    reading_streak: { title: 'سلسلة القراءة', description: 'اقرأ القصص 7 أيام متتالية' },
    dedicated_reader: { title: 'قارئ مخلص', description: 'اقرأ القصص 30 يومًا متتاليًا' },
    
    adventure_lover: { title: 'محب المغامرة', description: 'أنشئ 3 قصص مغامرة' },
    fantasy_dreamer: { title: 'حالم الفانتازيا', description: 'أنشئ 3 قصص فانتازيا' },
    space_explorer: { title: 'مستكشف الفضاء', description: 'أنشئ 3 قصص فضائية' },
    
    illustration_artist: { title: 'فنان الرسوم', description: 'أنشئ 5 قصص مع الرسوم التوضيحية' },
    polyglot: { title: 'متعدد اللغات', description: 'أنشئ قصصًا بـ 3 لغات مختلفة' },
    epic_storyteller: { title: 'راوي ملحمي', description: 'أنشئ قصة من 10 صفحات أو أكثر' },
    
    early_bird: { title: 'المستيقظ مبكرًا', description: 'أنشئ قصة قبل الساعة 8 صباحًا' },
    night_owl: { title: 'بومة الليل', description: 'أنشئ قصة بعد الساعة 10 مساءً' },
    
    master_storyteller: { title: 'سيد الحكايات', description: 'افتح 10 شارات أخرى' },
  },
};

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

  const lang = (settings.language as string) ?? 'en';
  const localize = (def: BadgeDef) => {
    const entry = BADGE_I18N[lang]?.[def.id];
    return {
      title: entry?.title ?? def.titleKey,
      description: entry?.description ?? def.descriptionKey,
    };
  };

  const items = useMemo(() => {
    return BADGE_DEFS.map(def => {
      const progressRef = def.id.startsWith('streak') ? streak : completedCount;
      const earned = progressRef >= def.requiredStories;
      const { title, description } = localize(def);
      return { ...def, earned, title, description };
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
        badge={selectedBadge ? { ...selectedBadge, ...localize(selectedBadge) } : null} 
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
  item: { id: string; titleKey: string; descriptionKey: string; requiredStories: number; icon: string; title?: string; description?: string; }, 
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
        <Text style={styles.cardTitle}>{item.title ?? item.titleKey}</Text>
        <Text style={styles.cardDesc}>{item.description ?? item.descriptionKey}</Text>
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
  badge: (BadgeDef & { title?: string; description?: string }) | null,
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
            <Text style={styles.modalTitle}>{badge.title ?? badge.titleKey}</Text>
            <Text style={styles.modalDescription}>{badge.description ?? badge.descriptionKey}</Text>
            
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
