import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 VPlex Build System');
console.log('====================');
console.log('1. 🪟 Build Windows Installer');
console.log('2. 📱 Build Android APK');
console.log('3. 🚀 Build Both');
console.log('4. 🌐 Build PWA only');
console.log('5. 🧹 Clean builds');

rl.question('\nSelect option (1-5): ', (option) => {
  switch(option) {
    case '1':
      console.log('🪟 Building Windows...');
      execSync('node windows-build.js', { stdio: 'inherit' });
      break;
    case '2':
      console.log('📱 Building Android...');
      execSync('node android-build.js', { stdio: 'inherit' });
      break;
    case '3':
      console.log('🔨 Building both...');
      execSync('node windows-build.js', { stdio: 'inherit' });
      execSync('node android-build.js', { stdio: 'inherit' });
      break;
    case '4':
      console.log('🌐 Building PWA...');
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ PWA build complete in "dist" folder');
      break;
    case '5':
      console.log('🧹 Cleaning builds...');
      execSync('rm -rf dist dist-electron android', { stdio: 'inherit' });
      console.log('✅ Clean complete');
      break;
    default:
      console.log('❌ Invalid option');
  }
  rl.close();
});