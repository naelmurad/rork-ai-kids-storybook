import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart } from 'lucide-react-native';
import { Story } from '@/types/story';
import { useAppSettings } from '@/hooks/app-settings';

const BANNER_HEIGHT = 120;

interface StoryBannerProps {
  onStoryPress?: (story: Story) => void;
}

// Multi-language inspirational quotes
const getInspirationalQuotes = (language: string) => {
  const quotes = {
    en: [
      {
        id: 'quote-1',
        text: 'Every story is a journey waiting to begin',
        author: 'Story Magic',
        gradient: ['#667eea', '#764ba2'] as const
      },
      {
        id: 'quote-2',
        text: 'Imagination is the only weapon in the war against reality',
        author: 'Lewis Carroll',
        gradient: ['#f093fb', '#f5576c'] as const
      },
      {
        id: 'quote-3',
        text: 'A book is a dream you hold in your hands',
        author: 'Neil Gaiman',
        gradient: ['#4facfe', '#00f2fe'] as const
      },
      {
        id: 'quote-4',
        text: 'Stories are the creative conversion of life itself',
        author: 'Ben Okri',
        gradient: ['#43e97b', '#38f9d7'] as const
      },
      {
        id: 'quote-5',
        text: 'Reading gives us someplace to go when we have to stay where we are',
        author: 'Mason Cooley',
        gradient: ['#fa709a', '#fee140'] as const
      }
    ],
    es: [
      {
        id: 'quote-1',
        text: 'Cada historia es un viaje esperando comenzar',
        author: 'Magia de Cuentos',
        gradient: ['#667eea', '#764ba2'] as const
      },
      {
        id: 'quote-2',
        text: 'La imaginación es la única arma en la guerra contra la realidad',
        author: 'Lewis Carroll',
        gradient: ['#f093fb', '#f5576c'] as const
      },
      {
        id: 'quote-3',
        text: 'Un libro es un sueño que sostienes en tus manos',
        author: 'Neil Gaiman',
        gradient: ['#4facfe', '#00f2fe'] as const
      },
      {
        id: 'quote-4',
        text: 'Las historias son la conversión creativa de la vida misma',
        author: 'Ben Okri',
        gradient: ['#43e97b', '#38f9d7'] as const
      },
      {
        id: 'quote-5',
        text: 'Leer nos da un lugar a donde ir cuando tenemos que quedarnos donde estamos',
        author: 'Mason Cooley',
        gradient: ['#fa709a', '#fee140'] as const
      }
    ],
    fr: [
      {
        id: 'quote-1',
        text: 'Chaque histoire est un voyage qui attend de commencer',
        author: 'Magie des Histoires',
        gradient: ['#667eea', '#764ba2'] as const
      },
      {
        id: 'quote-2',
        text: 'L\'imagination est la seule arme dans la guerre contre la réalité',
        author: 'Lewis Carroll',
        gradient: ['#f093fb', '#f5576c'] as const
      },
      {
        id: 'quote-3',
        text: 'Un livre est un rêve que vous tenez dans vos mains',
        author: 'Neil Gaiman',
        gradient: ['#4facfe', '#00f2fe'] as const
      },
      {
        id: 'quote-4',
        text: 'Les histoires sont la conversion créative de la vie elle-même',
        author: 'Ben Okri',
        gradient: ['#43e97b', '#38f9d7'] as const
      },
      {
        id: 'quote-5',
        text: 'Lire nous donne un endroit où aller quand nous devons rester où nous sommes',
        author: 'Mason Cooley',
        gradient: ['#fa709a', '#fee140'] as const
      }
    ],
    it: [
      {
        id: 'quote-1',
        text: 'Ogni storia è un viaggio che aspetta di iniziare',
        author: 'Magia delle Storie',
        gradient: ['#667eea', '#764ba2'] as const
      },
      {
        id: 'quote-2',
        text: 'L\'immaginazione è l\'unica arma nella guerra contro la realtà',
        author: 'Lewis Carroll',
        gradient: ['#f093fb', '#f5576c'] as const
      },
      {
        id: 'quote-3',
        text: 'Un libro è un sogno che tieni nelle tue mani',
        author: 'Neil Gaiman',
        gradient: ['#4facfe', '#00f2fe'] as const
      },
      {
        id: 'quote-4',
        text: 'Le storie sono la conversione creativa della vita stessa',
        author: 'Ben Okri',
        gradient: ['#43e97b', '#38f9d7'] as const
      },
      {
        id: 'quote-5',
        text: 'Leggere ci dà un posto dove andare quando dobbiamo rimanere dove siamo',
        author: 'Mason Cooley',
        gradient: ['#fa709a', '#fee140'] as const
      }
    ],
    de: [
      {
        id: 'quote-1',
        text: 'Jede Geschichte ist eine Reise, die darauf wartet zu beginnen',
        author: 'Geschichten-Magie',
        gradient: ['#667eea', '#764ba2'] as const
      },
      {
        id: 'quote-2',
        text: 'Fantasie ist die einzige Waffe im Krieg gegen die Realität',
        author: 'Lewis Carroll',
        gradient: ['#f093fb', '#f5576c'] as const
      },
      {
        id: 'quote-3',
        text: 'Ein Buch ist ein Traum, den du in deinen Händen hältst',
        author: 'Neil Gaiman',
        gradient: ['#4facfe', '#00f2fe'] as const
      },
      {
        id: 'quote-4',
        text: 'Geschichten sind die kreative Umwandlung des Lebens selbst',
        author: 'Ben Okri',
        gradient: ['#43e97b', '#38f9d7'] as const
      },
      {
        id: 'quote-5',
        text: 'Lesen gibt uns einen Ort, wohin wir gehen können, wenn wir bleiben müssen, wo wir sind',
        author: 'Mason Cooley',
        gradient: ['#fa709a', '#fee140'] as const
      }
    ],
    zh: [
      {
        id: 'quote-1',
        text: '每个故事都是一段等待开始的旅程',
        author: '故事魔法',
        gradient: ['#667eea', '#764ba2'] as const
      },
      {
        id: 'quote-2',
        text: '想象力是对抗现实战争中的唯一武器',
        author: '刘易斯·卡罗尔',
        gradient: ['#f093fb', '#f5576c'] as const
      },
      {
        id: 'quote-3',
        text: '书是你手中握着的梦想',
        author: '尼尔·盖曼',
        gradient: ['#4facfe', '#00f2fe'] as const
      },
      {
        id: 'quote-4',
        text: '故事是生活本身的创造性转换',
        author: '本·奥克里',
        gradient: ['#43e97b', '#38f9d7'] as const
      },
      {
        id: 'quote-5',
        text: '阅读给了我们一个去处，当我们必须留在原地时',
        author: '梅森·库利',
        gradient: ['#fa709a', '#fee140'] as const
      }
    ],
    ar: [
      {
        id: 'quote-1',
        text: 'كل قصة هي رحلة تنتظر أن تبدأ',
        author: 'سحر القصص',
        gradient: ['#667eea', '#764ba2'] as const
      },
      {
        id: 'quote-2',
        text: 'الخيال هو السلاح الوحيد في الحرب ضد الواقع',
        author: 'لويس كارول',
        gradient: ['#f093fb', '#f5576c'] as const
      },
      {
        id: 'quote-3',
        text: 'الكتاب هو حلم تحمله بين يديك',
        author: 'نيل غايمان',
        gradient: ['#4facfe', '#00f2fe'] as const
      },
      {
        id: 'quote-4',
        text: 'القصص هي التحويل الإبداعي للحياة نفسها',
        author: 'بن أوكري',
        gradient: ['#43e97b', '#38f9d7'] as const
      },
      {
        id: 'quote-5',
        text: 'القراءة تعطينا مكاناً نذهب إليه عندما نضطر للبقاء حيث نحن',
        author: 'ماسون كولي',
        gradient: ['#fa709a', '#fee140'] as const
      }
    ]
  };
  
  return quotes[language as keyof typeof quotes] || quotes.en;
};

export default function StoryBanner({ onStoryPress }: StoryBannerProps) {
  const { width: screenWidth } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { currentLanguage } = useAppSettings();
  
  const BANNER_WIDTH = screenWidth - 40;
  const styles = createStyles(screenWidth);
  
  // Get quotes based on current language
  const bannerItems = getInspirationalQuotes(currentLanguage);
  
  useEffect(() => {
    if (bannerItems.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % bannerItems.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * BANNER_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, [bannerItems.length, BANNER_WIDTH]);
  
  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / BANNER_WIDTH);
    if (index !== currentIndex && index >= 0 && index < bannerItems.length) {
      setCurrentIndex(index);
    }
  };
  
  const handleMomentumScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / BANNER_WIDTH);
    setCurrentIndex(index);
  };
  

  
  const renderQuoteBanner = (quote: any, index: number) => {
    if (!quote?.id?.trim() || quote.id.length > 100) return null;
    
    return (
      <View key={quote.id} style={styles.bannerItem}>
        <LinearGradient
          colors={quote.gradient}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerContent}>
            <View style={styles.quoteBannerContent}>
              <Heart size={20} color="#FFF" style={styles.quoteIcon} />
              <Text style={styles.quoteText} numberOfLines={2}>
                &ldquo;{quote.text}&rdquo;
              </Text>
              <Text style={styles.quoteAuthor}>— {quote.author}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };
  
  if (bannerItems.length === 0) return null;
  
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH}
        snapToAlignment="center"
      >
        {bannerItems.map((item, index) => 
          renderQuoteBanner(item, index)
        )}
      </ScrollView>
      
      {bannerItems.length > 1 && (
        <View style={styles.pagination}>
          {bannerItems.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const createStyles = (screenWidth: number) => StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  bannerItem: {
    width: screenWidth - 40,
    height: BANNER_HEIGHT,
    marginRight: 0,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bannerGradient: {
    flex: 1,
    padding: 16,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  quoteBannerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteIcon: {
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  quoteAuthor: {
    fontSize: 12,
    color: '#E8E8E8',
    fontStyle: 'italic',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CCC',
  },
  paginationDotActive: {
    backgroundColor: '#667eea',
    width: 20,
  },
});