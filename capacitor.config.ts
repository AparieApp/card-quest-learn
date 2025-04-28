
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.185bca7948834d8490d2e2a261d99b59',
  appName: 'Aparie',
  webDir: 'dist',
  server: {
    url: 'https://185bca79-4883-4d84-90d2-e2a261d99b59.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  // Enhanced iOS specific configuration
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#FFFFFF',
    // Setting status bar to match app theme
    statusBarStyle: 'dark',
    // Limit orientations to portrait for better UX on mobile
    preferredOrientation: 'portrait',
    // Allow the app to use user's location if needed
    permissions: [
      {
        name: 'Location Always Usage Description',
        usage: 'Your location is used to personalize content and improve user experience.'
      },
      {
        name: 'Location When In Use Usage Description',
        usage: 'Your location is used to personalize content when using the app.'
      }
    ]
  },
  // Enhanced Android specific configuration
  android: {
    backgroundColor: '#FFFFFF',
    // Setting Android status bar to match app theme
    androidXEnabled: true,
    webContentsDebuggingEnabled: false
  },
  // Adding enhanced plugins configuration
  plugins: {
    Keyboard: {
      resize: true,
      style: 'dark',
      resizeOnFullScreen: true
    },
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#FFFFFF',
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true,
      // Set app logo as icon
      androidScaleType: 'CENTER_CROP'
    },
    // Adding status bar configuration
    StatusBar: {
      style: 'dark',
      backgroundColor: '#FFFFFF'
    },
    // Configure local notifications if needed
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#FF9B7D'
    },
    // Device settings
    Device: {
      overrideUserAgent: false
    },
    // App configuration
    App: {
      hideStatusBar: false,
      backgroundColorLight: '#FFFFFF',
      backgroundColorDark: '#222222',
      hideNavigationBar: false
    }
  }
};

export default config;
