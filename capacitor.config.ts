
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.185bca7948834d8490d2e2a261d99b59',
  appName: 'Aparie',
  webDir: 'dist',
  server: {
    url: 'https://185bca79-4883-4d84-90d2-e2a261d99b59.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  // iOS specific configuration
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#ffffff',
    // Setting status bar to match app theme
    statusBarStyle: 'dark'
  },
  // Android specific configuration
  android: {
    backgroundColor: '#ffffff'
  }
};

export default config;
