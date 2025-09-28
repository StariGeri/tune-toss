import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
    },
    featureText: {
      fontSize: 16,
      color: colors.icon,
      textAlign: 'center',
      marginBottom: 8,
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
            <View style={[styles.spotifyIcon, { backgroundColor: 'white', borderRadius: 12 }]} />
            <Text style={styles.loginButtonText}>Connect with Spotify</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.features}>
        <Text style={styles.featureText}>• Swipe through your tracks</Text>
        <Text style={styles.featureText}>• Preview songs before deciding</Text>
        <Text style={styles.featureText}>• Keep what you love, toss what you don&apos;t</Text>
      </View>
    </View>
  );
}
