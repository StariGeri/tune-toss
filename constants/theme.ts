/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const spotifyGreen = '#1DB954';
const spotifyBlack = '#191414';
const spotifyWhite = '#FFFFFF';
const spotifyGrayDark = '#F5F5F0';

const spotifyGrayLight = '#535353';


export const Colors = {
  light: {
    text: spotifyBlack,
    background: spotifyWhite,
    tint: spotifyGreen,
    icon: spotifyGrayLight,
    tabIconDefault: spotifyGrayLight,
    tabIconSelected: spotifyGreen,
    card: spotifyWhite,
    border: '#E5E5E5',
  },
  dark: {
    text: '#E5E7EB', // Softer white for better readability
    background: spotifyBlack,
    tint: spotifyGreen,
    icon: spotifyGrayDark,
    tabIconDefault: spotifyGrayDark,
    tabIconSelected: spotifyGreen,
    card: '#282828',
    border: '#404040',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
