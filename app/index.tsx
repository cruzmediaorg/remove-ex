import { useCallback, useState } from 'react';
import { StyleSheet, View, Dimensions, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ThemedText';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { removeSubjectFromPhoto } from '@/services/gemini';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48 - 16) / 2;

interface Photo {
  uri: string;
  width: number;
  height: number;
}

interface ProcessedPhoto {
  originalUri: string;
  processedUri: string;
  isProcessing: boolean;
  error?: string;
}

export default function HomeScreen() {
  const [subjectPhoto, setSubjectPhoto] = useState<Photo | null>(null);
  const [targetPhotos, setTargetPhotos] = useState<Photo[]>([]);
  const [processedPhotos, setProcessedPhotos] = useState<ProcessedPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const pickImage = useCallback(async (isSubject: boolean) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: !isSubject,
      selectionLimit: isSubject ? 1 : 5,
    });

    if (!result.canceled) {
      const photos = result.assets.map(asset => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      }));

      if (isSubject) {
        setSubjectPhoto(photos[0]);
        // Reset processed photos when subject changes
        setProcessedPhotos([]);
      } else {
        setTargetPhotos(current => [...current, ...photos].slice(0, 5));
      }
    }
  }, []);

  const removePhoto = useCallback((index: number) => {
    setTargetPhotos(current => current.filter((_, i) => i !== index));
    setProcessedPhotos(current => current.filter((_, i) => i !== index));
  }, []);

  const processPhotos = useCallback(async () => {
    if (!subjectPhoto || targetPhotos.length === 0) {
      Alert.alert('Error', 'Please select both a subject and at least one target photo');
      return;
    }

    setIsProcessing(true);

    try {
      // Initialize processed photos array with loading state
      const initialProcessedState = targetPhotos.map(photo => ({
        originalUri: photo.uri,
        processedUri: '',
        isProcessing: true,
      }));
      setProcessedPhotos(initialProcessedState);

      // Process each photo one by one
      for (let i = 0; i < targetPhotos.length; i++) {
        try {
          const result = await removeSubjectFromPhoto(
            subjectPhoto.uri,
            targetPhotos[i].uri,
            "put the shirt red."
          );

          setProcessedPhotos(current => {
            const updated = [...current];
            updated[i] = {
              originalUri: targetPhotos[i].uri,
              processedUri: result.success ? result.localUri! : '',
              isProcessing: false,
              error: result.success ? undefined : result.error,
            };
            return updated;
          });
        } catch (error) {
          setProcessedPhotos(current => {
            const updated = [...current];
            updated[i] = {
              originalUri: targetPhotos[i].uri,
              processedUri: '',
              isProcessing: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
            return updated;
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  }, [subjectPhoto, targetPhotos]);

  return (
    <LinearGradient colors={['#1A1A1A', '#000000']} style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(1000).springify()}>
            <ThemedText style={styles.title}>Remove Subject</ThemedText>
          </Animated.View>
          
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Step 1: Select person to remove</ThemedText>
            <TouchableOpacity style={styles.subjectButton} onPress={() => pickImage(true)}>
              <LinearGradient
                colors={subjectPhoto ? ['transparent', 'transparent'] : ['#2A2A2A', '#1A1A1A']}
                style={StyleSheet.absoluteFill}
              />
              {subjectPhoto ? (
                <Image source={{ uri: subjectPhoto.uri }} style={styles.subjectPhoto} />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="person-add" size={32} color="#8B5CF6" />
                  <ThemedText style={styles.placeholderText}>Select Person</ThemedText>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Step 2: Select photos to edit</ThemedText>
            <View style={styles.targetPhotosContainer}>
              {targetPhotos.map((photo, index) => (
                <View key={photo.uri} style={styles.targetPhotoWrapper}>
                  <Image source={{ uri: photo.uri }} style={styles.targetPhoto} />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF4D4D" />
                  </TouchableOpacity>
                </View>
              ))}
              
              {targetPhotos.length < 5 && (
                <TouchableOpacity 
                  style={styles.addTargetButton}
                  onPress={() => pickImage(false)}
                >
                  <Ionicons name="add" size={32} color="#8B5CF6" />
                  <ThemedText style={styles.placeholderText}>Add Photo</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.processButton,
              (!subjectPhoto || targetPhotos.length === 0 || isProcessing) && styles.disabledButton
            ]}
            onPress={processPhotos}
            disabled={!subjectPhoto || targetPhotos.length === 0 || isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.processButtonText}>
                Remove Subject from Photos
              </ThemedText>
            )}
          </TouchableOpacity>

          {processedPhotos.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Results</ThemedText>
              <View style={styles.resultsContainer}>
                {processedPhotos.map((processedPhoto, index) => (
                  <View key={`result-${index}`} style={styles.resultItem}>
                    {processedPhoto.isProcessing ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator color="#FFFFFF" size="large" />
                        <ThemedText style={styles.loadingText}>Processing image...</ThemedText>
                      </View>
                    ) : processedPhoto.error ? (
                      <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={32} color="#FF4D4D" />
                        <ThemedText style={styles.errorText}>
                          Error processing image: {processedPhoto.error}
                        </ThemedText>
                      </View>
                    ) : (
                      <View style={styles.processedImageContainer}>
                        <ThemedText style={styles.resultTitle}>Processed Image</ThemedText>
                        <Image 
                          source={{ uri: processedPhoto.processedUri }} 
                          style={styles.processedImage}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 36,
    marginBottom: 32,
    color: '#fff',
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 40,
    backgroundColor: '#1A1A1A15',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  sectionTitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 20,
    marginBottom: 20,
    color: '#fff',
    opacity: 0.9,
  },
  subjectButton: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#ffffff15',
  },
  subjectPhoto: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 16,
    opacity: 0.6,
    color: 'white',
  },
  targetPhotosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -8,
  },
  targetPhotoWrapper: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  targetPhoto: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  addTargetButton: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: 8,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#ffffff15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: '#8B5CF650',
  },
  processButtonText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  resultsContainer: {
    gap: 24,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  loadingContainer: {
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
  },
  errorText: {
    color: '#FF4D4D',
    marginTop: 8,
    textAlign: 'center',
  },
  resultTitle: {
    fontSize: 18,
    fontFamily: 'Figtree_600SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  processedImageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  processedImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
  },
});