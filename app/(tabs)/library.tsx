import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStories } from '@/hooks/story-store';
import { useAppSettings } from '@/hooks/app-settings';
import { Story } from '@/types/story';
import StoryCard from '@/components/StoryCard';
import StoryReader from '@/components/StoryReader';


export default function LibraryScreen() {
  const { stories, isLoading, deleteStory } = useStories();
  const { t, currentLanguage } = useAppSettings();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<Story | null>(null);
  const insets = useSafeAreaInsets();

  const handleDeleteStory = (story: Story) => {
    if (!story?.id?.trim() || story.id.length > 100) return;
    setShowDeleteModal(story);
  };

  const confirmDelete = () => {
    if (showDeleteModal) {
      deleteStory(showDeleteModal.id);
      setShowDeleteModal(null);
    }
  };

  const renderDeleteModal = () => (
    <Modal
      visible={!!showDeleteModal}
      transparent
      animationType="fade"
    >
      <View style={styles.deleteOverlay}>
        <View style={styles.deleteModal}>
          <Text style={styles.deleteTitle}>{currentLanguage === 'ar' ? 'حذف القصة' : 'Delete Story'}</Text>
          <Text style={styles.deleteMessage}>
            {currentLanguage === 'ar' ? `هل أنت متأكد من حذف "${showDeleteModal?.title}"؟` : `Are you sure you want to delete "${showDeleteModal?.title}"?`}
          </Text>
          <View style={styles.deleteButtons}>
            <TouchableOpacity
              style={[styles.deleteButton, styles.cancelButton]}
              onPress={() => setShowDeleteModal(null)}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteButton, styles.confirmButton]}
              onPress={confirmDelete}
            >
              <Text style={styles.confirmButtonText}>{currentLanguage === 'ar' ? 'حذف' : 'Delete'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderStoryReader = () => {
    if (!selectedStory) return null;
    
    return (
      <Modal visible={true} animationType="slide" presentationStyle="fullScreen">
        <StoryReader
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      </Modal>
    );
  };

  const groupedStories = stories.reduce((groups: { [key: string]: Story[] }, story) => {
    const date = new Date(story.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(story);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedStories).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <Text style={[styles.headerTitle, currentLanguage === 'ar' && styles.rtlText]}>{t('library')}</Text>
        <Text style={[styles.headerSubtitle, currentLanguage === 'ar' && styles.rtlText]}>
          {currentLanguage === 'ar' 
            ? `${stories.length} ${stories.length === 1 ? 'قصة سحرية' : 'قصص سحرية'} محفوظة`
            : `${stories.length} magical ${stories.length === 1 ? 'story' : 'stories'} saved`
          }
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <BookOpen size={48} color="#CCC" />
            <Text style={styles.loadingText}>{currentLanguage === 'ar' ? 'جاري تحميل المكتبة...' : 'Loading library...'}</Text>
          </View>
        ) : stories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BookOpen size={64} color="#CCC" />
            <Text style={styles.emptyText}>{currentLanguage === 'ar' ? 'مكتبتك فارغة' : 'Your library is empty'}</Text>
            <Text style={styles.emptySubtext}>
              {currentLanguage === 'ar' ? 'القصص التي تنشئها ستظهر هنا للوصول السهل' : 'Stories you create will appear here for easy access'}
            </Text>
          </View>
        ) : (
          sortedDates.map((date) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={[styles.dateHeader, currentLanguage === 'ar' && styles.rtlText]}>
                {new Date(date).toLocaleDateString(currentLanguage === 'ar' ? 'ar-SA' : 'en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              {groupedStories[date].map((story) => (
                <View key={story.id} style={styles.storyContainer}>
                  <View style={styles.storyCardContainer}>
                    <StoryCard
                      story={story}
                      onPress={() => setSelectedStory(story)}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButtonIcon}
                    onPress={() => handleDeleteStory(story)}
                    activeOpacity={0.7}
                  >
                    <Trash2 size={20} color="#FF4757" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {renderStoryReader()}
      {renderDeleteModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E8E8E8',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  storyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  storyCardContainer: {
    flex: 1,
  },
  deleteButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModal: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 40,
    alignItems: 'center',
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  deleteMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  confirmButton: {
    backgroundColor: '#FF4757',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});