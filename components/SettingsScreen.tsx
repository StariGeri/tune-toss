import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const PREVIEW_PROVIDER_KEY = 'preview_provider';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [previewProvider, setPreviewProvider] = useState<'apple' | 'deezer'>('apple');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const provider = await AsyncStorage.getItem(PREVIEW_PROVIDER_KEY);
      if (provider === 'deezer') {
        setPreviewProvider('deezer');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const savePreviewProvider = async (provider: 'apple' | 'deezer') => {
    try {
      await AsyncStorage.setItem(PREVIEW_PROVIDER_KEY, provider);
      setPreviewProvider(provider);
    } catch (error) {
      console.error('Error saving preview provider:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from Spotify?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const showAbout = () => {
    Alert.alert(
      'About TuneToss',
      'TuneToss helps you clean and curate your Spotify playlists with a fun, swipe-based interface.\n\nVersion 1.0.0\n\nDeveloped with ❤️ for music lovers.',
      [{ text: 'OK' }]
    );
  };

  const showPrivacyInfo = () => {
    Alert.alert(
      'Privacy & Data',
      'TuneToss only accesses your Spotify playlists and basic profile information. We use third-party APIs (Apple Music, Deezer) to provide audio previews.\n\nNo personal data is stored on our servers. All playlist modifications are made directly through Spotify\'s API.',
      [{ text: 'OK' }]
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
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.icon,
    },
    content: {
      flex: 1,
    },
    section: {
      marginTop: 32,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingIcon: {
      marginRight: 16,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 2,
    },
    settingDescription: {
      fontSize: 14,
      color: colors.icon,
    },
    settingAction: {
      marginLeft: 12,
    },
    userSection: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    userImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 16,
    },
    userImagePlaceholder: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 16,
      color: colors.icon,
    },
    providerOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    providerSelected: {
      borderColor: colors.tint,
      backgroundColor: colors.tint + '10',
    },
    providerIcon: {
      marginRight: 12,
    },
    providerInfo: {
      flex: 1,
    },
    providerName: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    providerDescription: {
      fontSize: 14,
      color: colors.icon,
      marginTop: 2,
    },
    logoutButton: {
      backgroundColor: '#FF4444',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      marginHorizontal: 20,
      marginTop: 32,
      marginBottom: 20,
    },
    logoutButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.userSection}>
          {user?.images?.[0]?.url ? (
            <Image source={{ uri: user.images[0].url }} style={styles.userImage} />
          ) : (
            <View style={styles.userImagePlaceholder}>
              <IconSymbol name="person.fill" size={24} color={colors.icon} />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.display_name || 'Unknown User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'No email available'}</Text>
          </View>
        </View>

        {/* Audio Preview Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Preview</Text>
          
          <TouchableOpacity
            style={[
              styles.providerOption,
              previewProvider === 'apple' && styles.providerSelected,
            ]}
            onPress={() => savePreviewProvider('apple')}
          >
            <View style={styles.providerIcon}>
              <IconSymbol name="music.note" size={24} color={colors.text} />
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>Apple Music</Text>
              <Text style={styles.providerDescription}>
                High-quality previews from iTunes Store
              </Text>
            </View>
            {previewProvider === 'apple' && (
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.providerOption,
              previewProvider === 'deezer' && styles.providerSelected,
            ]}
            onPress={() => savePreviewProvider('deezer')}
          >
            <View style={styles.providerIcon}>
              <IconSymbol name="waveform" size={24} color={colors.text} />
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>Deezer</Text>
              <Text style={styles.providerDescription}>
                Alternative preview source with good coverage
              </Text>
            </View>
            {previewProvider === 'deezer' && (
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
            )}
          </TouchableOpacity>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={showAbout}>
            <View style={styles.settingIcon}>
              <IconSymbol name="info.circle" size={24} color={colors.icon} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>About TuneToss</Text>
              <Text style={styles.settingDescription}>Version and app information</Text>
            </View>
            <View style={styles.settingAction}>
              <IconSymbol name="chevron.right" size={20} color={colors.icon} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={showPrivacyInfo}>
            <View style={styles.settingIcon}>
              <IconSymbol name="lock.shield" size={24} color={colors.icon} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy & Data</Text>
              <Text style={styles.settingDescription}>How we handle your information</Text>
            </View>
            <View style={styles.settingAction}>
              <IconSymbol name="chevron.right" size={20} color={colors.icon} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout from Spotify</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
