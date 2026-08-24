import { execSync } from 'child_process';
import fs from 'fs';

console.log('🪟 Building Windows App (Simple Method)...');

try {
    // Build React app
    console.log('📦 Building React app...');
    execSync('npm run build', { stdio: 'inherit' });

    // Use electron-packager directly
    console.log('🔨 Packaging app...');
    execSync('npx electron-packager . VPlex --platform=win32 --arch=x64 --out=dist-electron --overwrite --icon=public/logo.png', { stdio: 'inherit' });

    console.log('✅ Build complete!');
    console.log('📁 App is in: dist-electron\\VPlex-win32-x64');
    console.log('📄 Run it with: dist-electron\\VPlex-win32-x64\\VPlex.exe');
} catch (error) {
    console.error('❌ Build failed:', error.message);
}