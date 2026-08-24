import { execSync } from 'child_process';
import fs from 'fs';

console.log('📱 Building Android APK...');

try {
  // Build React app
  console.log('📦 Building React app...');
  execSync('npm run build', { stdio: 'inherit' });

  // Sync Capacitor
  console.log('🔄 Syncing Capacitor...');
  execSync('npx cap sync android', { stdio: 'inherit' });

  // Build Android
  console.log('🔨 Building Android APK...');
  process.chdir('android');
  
  // For Windows, use gradlew.bat
  const gradleCmd = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  execSync(`${gradleCmd} assembleRelease`, { stdio: 'inherit' });
  process.chdir('..');

  // Copy APK to root
  const apkSource = 'android/app/build/outputs/apk/release/app-release.apk';
  const apkDest = 'VPlex-Android.apk';
  
  if (fs.existsSync(apkSource)) {
    fs.copyFileSync(apkSource, apkDest);
    console.log(`✅ APK created: ${apkDest}`);
  } else {
    console.log('⚠️ Release APK not found, trying debug APK...');
    const debugSource = 'android/app/build/outputs/apk/debug/app-debug.apk';
    const debugDest = 'VPlex-Android-Debug.apk';
    if (fs.existsSync(debugSource)) {
      fs.copyFileSync(debugSource, debugDest);
      console.log(`✅ Debug APK created: ${debugDest}`);
    }
  }

  console.log('🎉 Android build complete!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
}