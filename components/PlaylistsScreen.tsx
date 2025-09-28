import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SpotifyPlaylist, spotifyService } from '@/services/spotify';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PlaylistsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPlaylists = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const allPlaylists = await spotifyService.getUserPlaylists(50, 0);
      // Filter to only show playlists created by the current user
      const userCreatedPlaylists = allPlaylists.filter(playlist => 
        playlist.owner.id === user?.id
      );
      setPlaylists(userCreatedPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
      Alert.alert(
        'Error',
        'Failed to load playlists. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  const filterPlaylists = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredPlaylists(playlists);
    } else {
      const filtered = playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        playlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPlaylists(filtered);
    }
  }, [searchQuery, playlists]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  useEffect(() => {
    filterPlaylists();
  }, [filterPlaylists]);

  // Refresh playlists when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      // Only refresh if we already have playlists loaded (not on initial load)
      if (playlists.length > 0) {
        loadPlaylists(true);
      }
    }, [playlists.length, loadPlaylists])
  );

  const handlePlaylistSelect = (playlist: SpotifyPlaylist) => {
    // Navigate to swipe screen with playlist data
    router.push({
      pathname: '/swipe',
      params: {
        playlistId: playlist.id,
        playlistName: playlist.name,
      },
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const renderPlaylistItem = ({ item, index }: { item: SpotifyPlaylist; index: number }) => {
    const imageUrl = item.images?.[0]?.url;
    
    return (
      <TouchableOpacity
        style={[
          styles.playlistCard,
          { 
            backgroundColor: colors.card,
            shadowColor: colorScheme === 'dark' ? '#000' : '#000',
          }
        ]}
        onPress={() => handlePlaylistSelect(item)}
        activeOpacity={0.9}
      >
        {/* Card Background Gradient */}
        <LinearGradient
          colors={colorScheme === 'dark' 
            ? ['rgba(29, 185, 84, 0.1)', 'rgba(29, 185, 84, 0.05)'] 
            : ['rgba(29, 185, 84, 0.05)', 'rgba(29, 185, 84, 0.02)']
          }
          style={styles.cardGradient}
        />
        
        {/* Playlist Image with Enhanced Design */}
        <View style={styles.imageSection}>
          <View style={[styles.imageContainer, { shadowColor: colors.text }]}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.playlistImage} />
            ) : (
              <LinearGradient
                colors={['#1DB954', '#1ed760']}
                style={styles.playlistImagePlaceholder}
              >
                <IconSymbol name="music.note" size={32} color="white" />
              </LinearGradient>
            )}
          </View>
          
        </View>
        
        {/* Content Section */}
        <View style={styles.contentSection}>
          <View style={styles.playlistHeader}>
            <Text style={[styles.playlistName, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.playButton}>
              <IconSymbol name="play.fill" size={16} color={colors.tint} />
            </View>
          </View>
          
          <Text style={[styles.playlistOwner, { color: colors.icon }]} numberOfLines={1}>
            by {item.owner.display_name}
          </Text>
          
          {item.description && (
            <Text style={[styles.playlistDescription, { color: colors.icon }]} numberOfLines={3}>
              {item.description}
            </Text>
          )}
          
          {/* Bottom Info Row */}
          <View style={styles.bottomInfo}>
            <View style={styles.infoChip}>
              <IconSymbol name="music.note.list" size={12} color={colors.icon} />
              <Text style={[styles.infoChipText, { color: colors.icon }]}>
                {item.tracks.total} songs
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerGradient: {
      paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0,
    },
    header: {
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    titleSection: {
      flex: 1,
    },
    welcomeText: {
      fontSize: 32,
      fontWeight: '800',
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    subtitleText: {
      fontSize: 16,
      fontWeight: '500',
      opacity: 0.8,
    },
    profileButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    userImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    userImagePlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderWidth: 1,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      marginLeft: 12,
      marginRight: 8,
    },
    content: {
      flex: 1,
    },
    listContainer: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    // Modern Card Styles
    playlistCard: {
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
      marginBottom: 4,
    },
    cardGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    imageSection: {
      padding: 20,
      paddingBottom: 16,
      position: 'relative',
    },
    imageContainer: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    playlistImage: {
      width: screenWidth - 48 - 40,
      height: (screenWidth - 48 - 40) * 0.6,
      borderRadius: 16,
    },
    playlistImagePlaceholder: {
      width: screenWidth - 48 - 40,
      height: (screenWidth - 48 - 40) * 0.6,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    trackCountBadge: {
      position: 'absolute',
      top: 32,
      right: 32,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    trackCountText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '700',
    },
    contentSection: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    playlistHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    playlistName: {
      fontSize: 22,
      fontWeight: '700',
      flex: 1,
      marginRight: 12,
      lineHeight: 28,
    },
    playButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(29, 185, 84, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playlistOwner: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      opacity: 0.8,
    },
    playlistDescription: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 16,
      opacity: 0.7,
    },
    bottomInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    infoChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(29, 185, 84, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    infoChipText: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
    },
    
    // Empty State Styles
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    emptyStateTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyStateText: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
      opacity: 0.8,
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.emptyStateText, { marginTop: 16 }]}>Loading your playlists...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background}
      />
      
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={colorScheme === 'dark' 
          ? [colors.background, 'rgba(25, 20, 20, 0.95)'] 
          : [colors.background, 'rgba(255, 255, 255, 0.95)']
        }
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          {/* Header Top Section */}
          <View style={styles.headerTop}>
            <View style={styles.titleSection}>
              <Text style={[styles.welcomeText, { color: colors.text }]}>
                Your Music
              </Text>
              <Text style={[styles.subtitleText, { color: colors.icon }]}>
                {filteredPlaylists.length} playlist{filteredPlaylists.length !== 1 ? 's' : ''}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.profileButton, { backgroundColor: colors.card }]}
              onPress={handleLogout}
            >
              {user?.images?.[0]?.url ? (
                <Image source={{ uri: user.images[0].url }} style={styles.userImage} />
              ) : (
                <View style={[styles.userImagePlaceholder, { backgroundColor: colors.tint }]}>
                  <IconSymbol name="person.fill" size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Enhanced Search Bar */}
          <View style={[styles.searchContainer, { 
            backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            borderColor: colors.border 
          }]}>
            <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search your playlists..."
              placeholderTextColor={colors.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol name="xmark.circle.fill" size={20} color={colors.icon} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {filteredPlaylists.length === 0 ? (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#1DB954', '#1ed760']}
              style={styles.emptyIconContainer}
            >
              <IconSymbol name="music.note.list" size={48} color="white" />
            </LinearGradient>
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
              {searchQuery ? 'No Results Found' : 'No Playlists Yet'}
            </Text>
            <Text style={[styles.emptyStateText, { color: colors.icon }]}>
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Create playlists in Spotify to get started.\nOnly playlists you created can be modified.'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredPlaylists}
            renderItem={renderPlaylistItem}
            keyExtractor={(item) => item.id}
            refreshing={isRefreshing}
            onRefresh={() => loadPlaylists(true)}
            showsVerticalScrollIndicator={false}
            numColumns={1}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          />
        )}
      </View>
    </View>
  );
}
