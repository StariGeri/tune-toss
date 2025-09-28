import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeMode, useTheme } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showThemeModal, setShowThemeModal] = useState(false);

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

  const getThemeModeLabel = (mode: ThemeMode): string => {
    switch (mode) {
      case 'system':
        return 'System';
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      default:
        return 'System';
    }
  };

  const getThemeModeDescription = (mode: ThemeMode): string => {
    switch (mode) {
      case 'system':
        return 'Follow system settings';
      case 'light':
        return 'Always use light theme';
      case 'dark':
        return 'Always use dark theme';
      default:
        return 'Follow system settings';
    }
  };

  const handleThemeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    setShowThemeModal(false);
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
    // Theme modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      width: '80%',
      maxWidth: 300,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    themeOptionSelected: {
      backgroundColor: colors.tint + '20',
    },
    themeOptionContent: {
      flex: 1,
      marginLeft: 12,
    },
    themeOptionTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    themeOptionDescription: {
      fontSize: 14,
      color: colors.icon,
      marginTop: 2,
    },
    closeButton: {
      marginTop: 16,
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: colors.border,
      borderRadius: 8,
      alignSelf: 'center',
    },
    closeButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
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

        {/* Appearance Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={() => setShowThemeModal(true)}>
            <View style={styles.settingIcon}>
              <IconSymbol name="paintbrush" size={24} color={colors.icon} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Theme</Text>
              <Text style={styles.settingDescription}>{getThemeModeLabel(themeMode)} - {getThemeModeDescription(themeMode)}</Text>
            </View>
            <View style={styles.settingAction}>
              <IconSymbol name="chevron.right" size={20} color={colors.icon} />
            </View>
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

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThemeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Theme</Text>
            
            {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.themeOption,
                  themeMode === mode && styles.themeOptionSelected
                ]}
                onPress={() => handleThemeSelect(mode)}
              >
                <IconSymbol 
                  name={themeMode === mode ? "checkmark.circle.fill" : "circle"} 
                  size={20} 
                  color={themeMode === mode ? colors.tint : colors.icon} 
                />
                <View style={styles.themeOptionContent}>
                  <Text style={styles.themeOptionTitle}>{getThemeModeLabel(mode)}</Text>
                  <Text style={styles.themeOptionDescription}>{getThemeModeDescription(mode)}</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
