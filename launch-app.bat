@echo off
echo 🚀 Starting VPlex Player...
echo 📱 Your app is running!
echo.
cd /d "%~dp0"
npm run electron:dev
pause