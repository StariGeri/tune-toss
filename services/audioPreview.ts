import axios from 'axios';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

export interface AudioPreview {
  url: string;
  duration: number;
  provider: 'apple' | 'deezer' | 'spotify';
}

export interface TrackSearchResult {
  id: string;
  name: string;
  artist: string;
  previewUrl?: string;
  duration?: number;
}

class AudioPreviewService {
  private player: any = null; // AudioPlayer from expo-audio
  private isPlaying = false;

  // Initialize audio session
  async initialize() {
    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  // Search for track preview on Apple Music
  private async searchAppleMusic(trackName: string, artistName: string): Promise<TrackSearchResult | null> {
    try {
      const query = encodeURIComponent(`${trackName} ${artistName}`);
      const response = await axios.get(
        `https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=1`
      );

      const results = response.data.results;
      if (results && results.length > 0) {
        const track = results[0];
        return {
          id: track.trackId.toString(),
          name: track.trackName,
          artist: track.artistName,
          previewUrl: track.previewUrl,
          duration: track.trackTimeMillis,
        };
      }
      return null;
    } catch (error) {
      console.error('Apple Music search error:', error);
      return null;
    }
  }

  // Search for track preview on Deezer
  private async searchDeezer(trackName: string, artistName: string): Promise<TrackSearchResult | null> {
    try {
      const query = encodeURIComponent(`${trackName} ${artistName}`);
      const response = await axios.get(
        `https://api.deezer.com/search?q=${query}&limit=1`
      );

      const results = response.data.data;
      if (results && results.length > 0) {
        const track = results[0];
        return {
          id: track.id.toString(),
          name: track.title,
          artist: track.artist.name,
          previewUrl: track.preview,
          duration: track.duration * 1000, // Convert to milliseconds
        };
      }
      return null;
    } catch (error) {
      console.error('Deezer search error:', error);
      return null;
    }
  }

  // Get audio preview for a track
  async getPreview(
    trackName: string,
    artistName: string,
    spotifyPreviewUrl?: string | null
  ): Promise<AudioPreview | null> {
    try {
      // First, try Spotify's own preview if available
      if (spotifyPreviewUrl) {
        return {
          url: spotifyPreviewUrl,
          duration: 30000, // Spotify previews are typically 30 seconds
          provider: 'spotify',
        };
      }

      // Try Apple Music first, then fall back to Deezer
      let result: TrackSearchResult | null = null;
      let provider: 'apple' | 'deezer' = 'apple';
      
      result = await this.searchAppleMusic(trackName, artistName);
      if (!result || !result.previewUrl) {
        result = await this.searchDeezer(trackName, artistName);
        provider = 'deezer';
      }

      if (result && result.previewUrl) {
        return {
          url: result.previewUrl,
          duration: result.duration || 30000,
          provider: provider,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting preview:', error);
      return null;
    }
  }

  // Load and play audio preview
  async playPreview(previewUrl: string): Promise<boolean> {
    try {
      // Stop current sound if playing
      await this.stopPreview();

      // Create new audio player with the URL
      this.player = createAudioPlayer({ uri: previewUrl });
      
      // Play the audio
      this.player.play();
      this.isPlaying = true;

      return true;
    } catch (error) {
      console.error('Error playing preview:', error);
      return false;
    }
  }

  // Pause audio preview
  async pausePreview(): Promise<boolean> {
    try {
      if (this.player && this.isPlaying) {
        this.player.pause();
        this.isPlaying = false;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error pausing preview:', error);
      return false;
    }
  }

  // Resume audio preview
  async resumePreview(): Promise<boolean> {
    try {
      if (this.player && !this.isPlaying) {
        this.player.play();
        this.isPlaying = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resuming preview:', error);
      return false;
    }
  }

  // Stop audio preview
  async stopPreview(): Promise<void> {
    try {
      if (this.player) {
        this.player.pause();
        this.player.release();
        this.player = null;
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Error stopping preview:', error);
    }
  }

  // Get current playback status
  getPlaybackStatus(): { isPlaying: boolean; hasSound: boolean } {
    return {
      isPlaying: this.isPlaying,
      hasSound: !!this.player,
    };
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    await this.stopPreview();
  }
}

export const audioPreviewService = new AudioPreviewService();
