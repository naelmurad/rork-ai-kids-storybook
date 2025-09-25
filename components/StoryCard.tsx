import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Calendar } from 'lucide-react-native';
import { Story } from '@/types/story';

interface StoryCardProps {
  story: Story;
  onPress: () => void;
}

export default function StoryCard({ story, onPress }: StoryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const firstPageImage = story.pages[0]?.imageBase64 ?? '';
  const hasValidImage = typeof firstPageImage === 'string' && firstPageImage.trim() !== '' && firstPageImage.length > 10;
  const imageUri = hasValidImage
    ? (firstPageImage.startsWith('data:') ? firstPageImage : `data:image/png;base64,${firstPageImage}`)
    : undefined;
  
  const getGenderColors = (gender?: 'boy' | 'girl') => {
    if (gender === 'boy') {
      return { primary: '#4A90E2', secondary: '#357ABD' };
    } else if (gender === 'girl') {
      return { primary: '#FF69B4', secondary: '#E91E63' };
    }
    return { primary: '#FF6B9D', secondary: '#C44569' };
  };
  
  const genderColors = getGenderColors(story.gender);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[genderColors.primary, genderColors.secondary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            {imageUri && imageUri.length > 0 ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="cover"
                onError={(error) => {
                  console.log('Image load error in StoryCard:', error.nativeEvent?.error);
                }}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <BookOpen size={32} color="#FFF" />
              </View>
            )}
          </View>
          
          <View style={styles.textContent}>
            <Text style={styles.title} numberOfLines={2}>
              {story.title}
            </Text>
            <Text style={styles.childName}>
              For {story.childName}, age {story.childAge}
            </Text>
            <View style={styles.footer}>
              <View style={styles.dateContainer}>
                <Calendar size={12} color="#FFF" />
                <Text style={styles.date}>{formatDate(story.createdAt)}</Text>
              </View>
              <Text style={styles.pageCount}>
                {story.pages.length} pages
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  childName: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#FFF',
    marginLeft: 4,
  },
  pageCount: {
    fontSize: 12,
    color: '#FFF',
  },
});