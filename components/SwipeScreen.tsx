import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AudioPreview, audioPreviewService } from '@/services/audioPreview';
import { PlaylistTrack, spotifyService } from '@/services/spotify';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.7;
const SWIPE_THRESHOLD = screenWidth * 0.25;

export default function SwipeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const playlistId = params.playlistId as string;
  const playlistName = params.playlistName as string;

  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tracksToRemove, setTracksToRemove] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPreview, setCurrentPreview] = useState<AudioPreview | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  const loadTracks = useCallback(async () => {
    try {
      setIsLoading(true);
      const playlistTracks = await spotifyService.getAllPlaylistTracks(playlistId);
      setTracks(playlistTracks);
    } catch (error) {
      console.error('Error loading tracks:', error);
      Alert.alert('Error', 'Failed to load playlist tracks.');
    } finally {
      setIsLoading(false);
    }
  }, [playlistId]);

  const loadPreview = useCallback(async () => {
    if (currentIndex >= tracks.length) return;

    const track = tracks[currentIndex].track;
    setIsLoadingPreview(true);
    setCurrentPreview(null);
    setIsPlaying(false);

    try {
      const preview = await audioPreviewService.getPreview(
        track.name,
        track.artists[0]?.name || '',
        track.preview_url
      );
      setCurrentPreview(preview);
      
      // Autoplay the preview if available
      if (preview) {
        try {
          const success = await audioPreviewService.playPreview(preview.url);
          if (success) {
            setIsPlaying(true);
          }
        } catch (playError) {
          console.error('Error auto-playing preview:', playError);
          // Don't throw error, just log it - user can still manually play
        }
      }
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [currentIndex, tracks]);

  useEffect(() => {
    loadTracks();
    return () => {
      audioPreviewService.cleanup();
    };
  }, [loadTracks]);

  useEffect(() => {
    if (tracks.length > 0 && currentIndex < tracks.length) {
      loadPreview();
    }
  }, [loadPreview, currentIndex, tracks.length]);

  const playPause = async () => {
    if (!currentPreview) return;

    try {
      if (isPlaying) {
        await audioPreviewService.pausePreview();
        setIsPlaying(false);
      } else {
        const success = await audioPreviewService.playPreview(currentPreview.url);
        if (success) {
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error playing/pausing preview:', error);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= tracks.length) return;

    const track = tracks[currentIndex].track;

    if (direction === 'right') {
      // Remove track (swipe right-to-left = remove)
      setTracksToRemove(prev => [...prev, track.uri]);
    }
    // If left, keep track (swipe left-to-right = keep)

    // Move to next track
    setCurrentIndex(prev => prev + 1);
    
    // Reset animations
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    rotate.value = withSpring(0);
    scale.value = withSpring(1);

    // Stop current preview
    audioPreviewService.stopPreview();
    setIsPlaying(false);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(0.95);
    })
    .onChange((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.1;
      rotate.value = (event.translationX / screenWidth) * 15;
    })
    .onEnd((event) => {
      scale.value = withSpring(1);
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        translateX.value = withTiming(
          direction === 'right' ? screenWidth : -screenWidth,
          { duration: 300 },
          () => runOnJS(handleSwipe)(direction)
        );
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  const handleFinish = async () => {
    if (tracksToRemove.length === 0) {
      Alert.alert('No Changes', 'No tracks were marked for removal.');
      router.back();
      return;
    }

    Alert.alert(
      'Confirm Changes',
      `Remove ${tracksToRemove.length} track${tracksToRemove.length > 1 ? 's' : ''} from "${playlistName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await spotifyService.removeTracksFromPlaylist(
                playlistId,
                tracksToRemove
              );
              
              if (success) {
                Alert.alert(
                  'Success',
                  `Removed ${tracksToRemove.length} track${tracksToRemove.length > 1 ? 's' : ''} from your playlist!`,
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              } else {
                Alert.alert('Error', 'Failed to update playlist. Please try again.');
              }
            } catch (error) {
              console.error('Error updating playlist:', error);
              Alert.alert('Error', 'Failed to update playlist. Please try again.');
            }
          },
        },
      ]
    );
  };

  const currentTrack = tracks[currentIndex]?.track;
  const progress = tracks.length > 0 ? ((currentIndex + 1) / tracks.length) * 100 : 0;
  const isFinished = currentIndex >= tracks.length;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 16,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    playlistTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 16,
    },
    finishButton: {
      backgroundColor: colors.tint,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 25,
      shadowColor: colors.tint,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    finishButtonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 16,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      marginBottom: 8,
    },
    progressBar: {
      flex: 1,
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      marginRight: 16,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.tint,
      borderRadius: 3,
    },
    progressText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '600',
    },
    cardContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 40,
    },
    card: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 12,
    },
    albumArt: {
      width: 240,
      height: 240,
      borderRadius: 20,
    },
    albumArtPlaceholder: {
      width: 240,
      height: 240,
      borderRadius: 20,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    trackInfo: {
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    trackName: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
      lineHeight: 32,
    },
    artistName: {
      fontSize: 20,
      color: colors.icon,
      textAlign: 'center',
      marginBottom: 6,
      fontWeight: '600',
    },
    albumName: {
      fontSize: 16,
      color: colors.icon,
      textAlign: 'center',
      fontWeight: '500',
      opacity: 0.8,
    },
    playButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.tint,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.tint,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingHorizontal: 40,
    },
    actionButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    removeButton: {
      backgroundColor: '#FF6B6B',
    },
    keepButton: {
      backgroundColor: '#51CF66',
    },
    finishedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    finishedTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    finishedSubtitle: {
      fontSize: 18,
      color: colors.icon,
      textAlign: 'center',
      marginBottom: 32,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.progressText, { marginTop: 16 }]}>Loading tracks...</Text>
      </View>
    );
  }

  if (isFinished) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.playlistTitle}>{playlistName}</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
        
        <View style={styles.finishedContainer}>
          <IconSymbol name="checkmark.circle.fill" size={80} color={colors.tint} />
          <Text style={styles.finishedTitle}>All Done!</Text>
          <Text style={styles.finishedSubtitle}>
            You&apos;ve reviewed all tracks in this playlist.
            {tracksToRemove.length > 0 && (
              `\n\n${tracksToRemove.length} track${tracksToRemove.length > 1 ? 's' : ''} marked for removal.`
            )}
          </Text>
          
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>
              {tracksToRemove.length > 0 ? 'Apply Changes' : 'Go Back'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.playlistTitle} numberOfLines={1}>{playlistName}</Text>
            <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
              <Text style={styles.finishButtonText}>Finish</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentIndex + 1} of {tracks.length}
          </Text>
        </View>

      <View style={styles.cardContainer}>
        {currentTrack && (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, animatedStyle]}>
              <View style={styles.albumArt}>
                {currentTrack.album.images?.[0]?.url ? (
                  <Image
                    source={{ uri: currentTrack.album.images[0].url }}
                    style={styles.albumArt}
                  />
                ) : (
                  <View style={styles.albumArtPlaceholder}>
                    <IconSymbol name="music.note" size={48} color={colors.icon} />
                  </View>
                )}
              </View>

              <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={2}>
                  {currentTrack.name}
                </Text>
                <Text style={styles.artistName} numberOfLines={1}>
                  {currentTrack.artists.map(artist => artist.name).join(', ')}
                </Text>
                <Text style={styles.albumName} numberOfLines={1}>
                  {currentTrack.album.name}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.playButton}
                onPress={playPause}
                disabled={!currentPreview || isLoadingPreview}
              >
                {isLoadingPreview ? (
                  <ActivityIndicator color="white" size="small" />
                ) : !currentPreview ? (
                  <IconSymbol name="speaker.slash" size={24} color="white" />
                ) : isPlaying ? (
                  <IconSymbol name="pause.fill" size={24} color="white" />
                ) : (
                  <IconSymbol name="play.fill" size={24} color="white" />
                )}
              </TouchableOpacity>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.keepButton]}
                  onPress={() => handleSwipe('left')}
                >
                  <IconSymbol name="heart.fill" size={28} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.removeButton]}
                  onPress={() => handleSwipe('right')}
                >
                  <IconSymbol name="xmark" size={28} color="white" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </GestureDetector>
        )}
      </View>
    </View>
  );
}
