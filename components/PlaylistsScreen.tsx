import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SpotifyPlaylist, spotifyService } from '@/services/spotify';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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

  const renderPlaylistItem = ({ item }: { item: SpotifyPlaylist }) => {
    const imageUrl = item.images?.[0]?.url;
    
    return (
      <TouchableOpacity
        style={[styles.playlistItem, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => handlePlaylistSelect(item)}
      >
        <View style={styles.playlistImageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.playlistImage} />
          ) : (
            <View style={[styles.playlistImagePlaceholder, { backgroundColor: colors.border }]}>
              <IconSymbol name="music.note" size={24} color={colors.icon} />
            </View>
          )}
        </View>
        
        <View style={styles.playlistInfo}>
          <Text style={[styles.playlistName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.playlistDetails, { color: colors.icon }]} numberOfLines={1}>
            {item.tracks.total} tracks • {item.owner.display_name}
          </Text>
          {item.description && (
            <Text style={[styles.playlistDescription, { color: colors.icon }]} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        
        <IconSymbol name="chevron.right" size={20} color={colors.icon} />
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 20,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userImage: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
    },
    userName: {
      fontSize: 16,
      color: colors.text,
      marginRight: 12,
    },
    logoutButton: {
      padding: 8,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: 8,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playlistItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
    },
    playlistImageContainer: {
      marginRight: 16,
    },
    playlistImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    playlistImagePlaceholder: {
      width: 60,
      height: 60,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playlistInfo: {
      flex: 1,
    },
    playlistName: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 4,
    },
    playlistDetails: {
      fontSize: 14,
      marginBottom: 2,
    },
    playlistDescription: {
      fontSize: 12,
      lineHeight: 16,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyStateText: {
      fontSize: 18,
      color: colors.icon,
      textAlign: 'center',
      marginTop: 16,
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
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.welcomeText}>Your Playlists</Text>
          <View style={styles.userInfo}>
            {user?.images?.[0]?.url && (
              <Image source={{ uri: user.images[0].url }} style={styles.userImage} />
            )}
            <Text style={styles.userName}>{user?.display_name}</Text>
          </View>
        </View>
        
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.icon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search playlists..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.content}>
        {filteredPlaylists.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="music.note.list" size={64} color={colors.icon} />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No playlists match your search' : 'No playlists created by you found.\nOnly playlists you created can be modified.'}
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
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        )}
      </View>
    </View>
  );
}
