import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('.'));

// Main website page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-website.html'));
});

// Downloads route
app.use('/downloads', express.static('dist-electron/VPlex-win32-x64'));
app.use('/downloads', express.static('.'));

// API to get available files
app.get('/api/files', (req, res) => {
    const files = {
        windows: fs.existsSync('dist-electron/VPlex-win32-x64/VPlex.exe') ? '/downloads/VPlex.exe' : null,
        android: fs.existsSync('VPlex-Android.apk') ? '/downloads/VPlex-Android.apk' : null,
        windowsZip: fs.existsSync('VPlex-Windows.zip') ? '/downloads/VPlex-Windows.zip' : null
    };
    res.json(files);
});

// Download tracking endpoint
app.post('/api/download', express.json(), (req, res) => {
    const { platform } = req.body;
    console.log(`📥 Download: ${platform} from ${req.ip}`);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`🚀 VPlex Website running!`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`\n📁 Available downloads:`);
    if (fs.existsSync('dist-electron/VPlex-win32-x64/VPlex.exe')) {
        console.log(`   ✅ Windows: dist-electron/VPlex-win32-x64/VPlex.exe`);
    }
    if (fs.existsSync('VPlex-Android.apk')) {
        console.log(`   ✅ Android: VPlex-Android.apk`);
    }
});