import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const success = await login();
      
      if (!success) {
        Alert.alert(
          'Login Failed',
          'Unable to connect to Spotify. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 40,
      borderRadius: 60,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 18,
      color: colors.icon,
      marginBottom: 50,
      textAlign: 'center',
      lineHeight: 24,
    },
    loginButton: {
      backgroundColor: colors.tint,
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 200,
    },
    loginButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
      marginLeft: 10,
    },
    spotifyIcon: {
      width: 24,
      height: 24,
    },
    features: {
      marginTop: 60,
      alignItems: 'center',
      width: '100%',
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 20,
    },
    featureIcon: {
      marginRight: 12,
      width: 24,
      alignItems: 'center',
    },
    featureText: {
      fontSize: 16,
      color: colors.icon,
      flex: 1,
      lineHeight: 22,
    },
  });

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/icon.png')}
        style={styles.logo}
      />
      
      <Text style={styles.title}>TuneToss</Text>
      <Text style={styles.subtitle}>
        Clean your Spotify playlists with a fun, swipe-based interface
      </Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <View style={styles.spotifyIcon}>
                <Entypo name="spotify" size={24} color="white" />
              </View>
            <Text style={styles.loginButtonText}>Connect with Spotify</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.features}>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <MaterialIcons name="swipe" size={24} color={colors.icon} />
          </View>
          <Text style={styles.featureText}>Swipe through your tracks</Text>
        </View>
        
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="play-circle-outline" size={24} color={colors.icon} />
          </View>
          <Text style={styles.featureText}>Preview songs before deciding</Text>
        </View>
        
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <MaterialIcons name="favorite-outline" size={24} color={colors.icon} />
          </View>
          <Text style={styles.featureText}>Keep what you love, toss what you don&apos;t</Text>
        </View>
        
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="flash-outline" size={24} color={colors.icon} />
          </View>
          <Text style={styles.featureText}>Changes sync instantly to your Spotify playlist</Text>
        </View>
      </View>
    </View>
  );
}
