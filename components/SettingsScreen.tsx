import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
      'TuneToss only accesses your Spotify playlists and basic profile information. We use third-party APIs (Apple Music, Deezer) to automatically provide audio previews.\n\nNo personal data is stored on our servers. All playlist modifications are made directly through Spotify\'s API.',
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
