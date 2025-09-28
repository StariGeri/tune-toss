import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AudioPreview, audioPreviewService } from '@/services/audioPreview';
import { PlaylistTrack, spotifyService } from '@/services/spotify';
import Entypo from '@expo/vector-icons/Entypo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
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
const CARD_WIDTH = screenWidth - 32; // Full width minus margins
const CARD_HEIGHT = screenHeight * 0.55;
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
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

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
          const success = await audioPreviewService.playPreview(preview.url, preview.duration);
          if (success) {
            setIsPlaying(true);
            setPlaybackDuration(preview.duration);
            setPlaybackPosition(0);
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

  // Update playback position
  useEffect(() => {
    const interval = setInterval(() => {
      const status = audioPreviewService.getPlaybackStatus();
      setPlaybackPosition(status.position);
      setIsPlaying(status.isPlaying);
    }, 100);

    return () => clearInterval(interval);
  }, []);

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
        const success = await audioPreviewService.playPreview(currentPreview.url, currentPreview.duration);
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
      // Remove track (swipe right = remove)
      setTracksToRemove(prev => [...prev, track.uri]);
    }
    // If left, keep track (swipe left = keep)

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
  const nextTrack = tracks[currentIndex + 1]?.track;
  const isFinished = currentIndex >= tracks.length;

  // Calculate progress percentage for timeline
  const progressPercentage = playbackDuration > 0 ? (playbackPosition / playbackDuration) * 100 : 0;

  const openSpotifyTrack = () => {
    if (currentTrack) {
      const spotifyUrl = `spotify:track:${currentTrack.id}`;
      const webUrl = `https://open.spotify.com/track/${currentTrack.id}`;
      
      Linking.canOpenURL(spotifyUrl).then(supported => {
        if (supported) {
          Linking.openURL(spotifyUrl);
        } else {
          Linking.openURL(webUrl);
        }
      });
    }
    setShowDropdown(false);
  };

  const openSpotifyPlaylist = () => {
    const spotifyUrl = `spotify:playlist:${playlistId}`;
    const webUrl = `https://open.spotify.com/playlist/${playlistId}`;
    
    Linking.canOpenURL(spotifyUrl).then(supported => {
      if (supported) {
        Linking.openURL(spotifyUrl);
      } else {
        Linking.openURL(webUrl);
      }
    });
    setShowDropdown(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#1a2332' : '#f8fafc',
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressContainer: {
      paddingHorizontal: 24,
      marginBottom: 20,
    },
    progressText: {
      fontSize: 16,
      color: colorScheme === 'dark' ? 'white' : '#1f2937',
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 8,
    },
    cardContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 140, // Space for next song section
    },
    card: {
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      backgroundColor: colorScheme === 'dark' ? '#2a3441' : 'white',
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
      shadowRadius: 16,
      elevation: 12,
    },
    albumArt: {
      width: 200,
      height: 200,
      borderRadius: 16,
    },
    albumArtPlaceholder: {
      width: 200,
      height: 200,
      borderRadius: 16,
      backgroundColor: colorScheme === 'dark' ? '#3a4551' : '#e5e7eb',
      justifyContent: 'center',
      alignItems: 'center',
    },
    trackInfo: {
      alignItems: 'center',
      paddingHorizontal: 16,
      marginTop: 20,
    },
    trackName: {
      fontSize: 24,
      fontWeight: '800',
      color: colorScheme === 'dark' ? 'white' : '#1f2937',
      textAlign: 'center',
      marginBottom: 8,
      lineHeight: 30,
    },
    artistName: {
      fontSize: 18,
      color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      marginBottom: 6,
      fontWeight: '600',
    },
    timelineContainer: {
      width: '100%',
      marginTop: 20,
      marginBottom: 20,
    },
    timeline: {
      height: 4,
      backgroundColor: colorScheme === 'dark' ? '#3a4551' : '#e5e7eb',
      borderRadius: 2,
      overflow: 'hidden',
    },
    timelineProgress: {
      height: '100%',
      backgroundColor: colorScheme === 'dark' ? 'white' : '#1f2937',
      borderRadius: 2,
    },
    controlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
    },
    playButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colorScheme === 'dark' ? 'white' : '#1f2937',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    actionButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#ef4444',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    keepButton: {
      backgroundColor: '#22c55e',
    },
    nextSongContainer: {
      position: 'absolute',
      bottom: 40,
      left: 16,
      right: 16,
      backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    nextSongIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colorScheme === 'dark' ? '#3a4551' : '#e5e7eb',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      overflow: 'hidden',
    },
    nextSongInfo: {
      flex: 1,
    },
    nextSongLabel: {
      color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280',
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
    },
    nextSongTitle: {
      color: colorScheme === 'dark' ? 'white' : '#1f2937',
      fontSize: 14,
      fontWeight: '600',
    },
    nextSongArtist: {
      color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280',
      fontSize: 12,
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
      color: colorScheme === 'dark' ? 'white' : '#1f2937',
      marginBottom: 16,
      textAlign: 'center',
    },
    finishedSubtitle: {
      fontSize: 18,
      color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280',
      textAlign: 'center',
      marginBottom: 32,
    },
    finishButton: {
      backgroundColor: colors.tint,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      shadowColor: colors.tint,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    finishButtonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 14,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colorScheme === 'dark' ? '#1a2332' : '#f8fafc',
    },
    // Dropdown styles
    dropdownOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingTop: 60,
      paddingRight: 24,
    },
    dropdownMenu: {
      backgroundColor: colorScheme === 'dark' ? '#2a3441' : 'white',
      borderRadius: 12,
      padding: 8,
      minWidth: 200,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      marginVertical: 2,
    },
    dropdownItemPressed: {
      backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    spotifyIcon: {
      width: 20,
      height: 20,
      marginRight: 12,
      backgroundColor: '#1DB954',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dropdownText: {
      color: colorScheme === 'dark' ? 'white' : '#1f2937',
      fontSize: 16,
      fontWeight: '500',
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? 'white' : '#1f2937'} />
        <Text style={[styles.progressText, { marginTop: 16 }]}>Loading tracks...</Text>
      </View>
    );
  }

  if (isFinished) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colorScheme === 'dark' ? 'white' : '#1f2937'} />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={colorScheme === 'dark' ? 'white' : '#1f2937'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => setShowDropdown(true)}>
          <IconSymbol name="ellipsis" size={20} color={colorScheme === 'dark' ? 'white' : '#1f2937'} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressContainer}>
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
                    <IconSymbol name="music.note" size={48} color="#9ca3af" />
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
              </View>

              <View style={styles.timelineContainer}>
                <View style={styles.timeline}>
                  <View style={[styles.timelineProgress, { width: `${progressPercentage}%` }]} />
                </View>
              </View>

              <View style={styles.controlsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSwipe('left')}
                >
                  <IconSymbol name="xmark" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.playButton}
                  onPress={playPause}
                  disabled={!currentPreview || isLoadingPreview}
                >
                  {isLoadingPreview ? (
                    <ActivityIndicator color={colorScheme === 'dark' ? '#1a2332' : 'white'} size="small" />
                  ) : !currentPreview ? (
                    <IconSymbol name="speaker.slash" size={24} color={colorScheme === 'dark' ? '#1a2332' : 'white'} />
                  ) : isPlaying ? (
                    <IconSymbol name="pause.fill" size={24} color={colorScheme === 'dark' ? '#1a2332' : 'white'} />
                  ) : (
                    <IconSymbol name="play.fill" size={24} color={colorScheme === 'dark' ? '#1a2332' : 'white'} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.keepButton]}
                  onPress={() => handleSwipe('right')}
                >
                  <IconSymbol name="heart.fill" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </GestureDetector>
        )}
      </View>


      {/* Next song preview */}
      {nextTrack && (
        <View style={styles.nextSongContainer}>
          <View style={styles.nextSongIcon}>
            {nextTrack.album.images?.[0]?.url ? (
              <Image
                source={{ uri: nextTrack.album.images[0].url }}
                style={{ width: 40, height: 40, borderRadius: 8 }}
              />
            ) : (
              <IconSymbol name="music.note" size={20} color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} />
            )}
          </View>
          <View style={styles.nextSongInfo}>
            <Text style={styles.nextSongLabel}>Next from: {playlistName}</Text>
            <Text style={styles.nextSongTitle} numberOfLines={1}>
              {nextTrack.name}
            </Text>
            <Text style={styles.nextSongArtist} numberOfLines={1}>
              {nextTrack.artists.map(artist => artist.name).join(', ')}
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} />
        </View>
      )}

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownMenu}>
            <TouchableOpacity 
              style={[styles.dropdownItem, styles.dropdownItemPressed]}
              onPress={openSpotifyTrack}  
            >
              <View style={styles.spotifyIcon}>
                <Entypo name="spotify" size={16} color="white" />
              </View>
              <Text style={styles.dropdownText}>Open song</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.dropdownItem, styles.dropdownItemPressed]}
              onPress={openSpotifyPlaylist}
            >
              <View style={styles.spotifyIcon}>
                <Entypo name="spotify" size={16} color="white" />
              </View>
              <Text style={styles.dropdownText}>Open playlist</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}