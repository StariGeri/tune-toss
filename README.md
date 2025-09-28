# TuneToss 🎵

A mobile app that allows users to clean and curate their Spotify playlists with a fun, intuitive swipe interface inspired by dating apps. Each track in a selected playlist is presented to the user with a 30-second preview, letting them swipe right to keep, left to remove.

## ✨ Features

### 🎧 Spotify Integration
- **OAuth Authentication**: Secure login with your Spotify account
- **Playlist Access**: View all your playlists in one place
- **Smart Search**: Find playlists quickly with built-in search
- **Playlist Management**: Remove tracks directly from your Spotify playlists

### 📱 Intuitive Interface
- **Tinder-style Swiping**: Swipe right to keep, left to remove tracks
- **Card-based Design**: Beautiful track cards with album artwork
- **Progress Tracking**: See how many tracks you've reviewed
- **Spotify-inspired Theme**: Dark/light mode with Spotify's signature green

### 🎵 Audio Previews
- **Multiple Sources**: Apple Music and Deezer API integration
- **30-second Previews**: Listen before you decide
- **Fallback System**: Automatic switching between preview providers
- **In-app Playback**: Play/pause controls with smooth audio handling

### ⚙️ Settings & Customization
- **Preview Provider**: Choose between Apple Music or Deezer
- **Account Management**: View profile and logout functionality
- **Privacy Information**: Transparent about data usage

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- Expo CLI (`npm install -g @expo/cli`)
- Spotify Developer Account
- iOS Simulator or Android Emulator (or physical device)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tunetoss
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Spotify API**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Copy your Client ID and Client Secret
   - Add redirect URI: `tunetoss://auth`

4. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Replace the placeholder values:
   ```
   EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   ```

5. **Run the app**
   ```bash
   # Start the development server
   npm start

   # Run on iOS
   npm run ios

   # Run on Android
   npm run android
   ```

## 🏗️ Technical Architecture

### Tech Stack
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Authentication**: Expo AuthSession with PKCE
- **Audio**: Expo AV
- **Storage**: AsyncStorage
- **Animations**: React Native Reanimated
- **Gestures**: React Native Gesture Handler

### API Integrations
- **Spotify Web API**: Authentication, playlist management, track data
- **Apple Music API**: Audio previews (iTunes Search API)
- **Deezer API**: Alternative audio preview source

### Project Structure
```
├── app/                    # Expo Router pages
├── components/            # React components
├── contexts/             # React contexts (Auth)
├── services/             # API services
├── constants/            # Theme and constants
├── hooks/               # Custom hooks
└── assets/              # Images and static files
```

## 🔒 Privacy & Security

- **OAuth 2.0 + PKCE**: Secure authentication without storing client secrets
- **Minimal Data**: Only accesses necessary Spotify data (playlists, profile)
- **No Server Storage**: All data processing happens on-device
- **Third-party APIs**: Uses public APIs for audio previews only

## 📱 Screenshots

*Screenshots will be added once the app is fully tested*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Spotify for their excellent Web API
- Apple Music and Deezer for audio preview APIs
- Expo team for the amazing development platform
- React Native community for the gesture and animation libraries

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include your device/OS information and error logs

---

**Made with ❤️ for music lovers who want cleaner playlists**