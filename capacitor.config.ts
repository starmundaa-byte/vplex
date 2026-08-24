import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vplex.app',
  appName: 'VPlex',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
