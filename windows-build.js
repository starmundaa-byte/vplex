import { execSync } from 'child_process';
import fs from 'fs';

console.log('🪟 Building Windows Installer...');

try {
  // Build React app
  console.log('📦 Building React app...');
  execSync('npm run build', { stdio: 'inherit' });

  // Build Electron installer
  console.log('🔨 Building Windows installer...');
  execSync('npx electron-builder --win --x64', { stdio: 'inherit' });

  // Create portable version
  console.log('📦 Building portable version...');
  execSync('npx electron-builder --win portable', { stdio: 'inherit' });

  console.log('✅ Windows build complete!');
  console.log('📁 Check the "dist-electron" folder for installers');
  
  // List the files created
  const distFolder = 'dist-electron';
  if (fs.existsSync(distFolder)) {
    console.log('\n📂 Files created:');
    const files = fs.readdirSync(distFolder);
    files.forEach(file => console.log(`   - ${file}`));
  }
} catch (error) {
  console.error('❌ Build failed:', error.message);
}