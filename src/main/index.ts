import { app, BrowserWindow, ipcMain, app as electronApp } from 'electron';
import * as path from 'path';
import { defaultWebSocketService } from './services/WebSocketServer';
import { exec } from 'child_process';

// Detect if running on Raspberry Pi
const isRaspberryPi = () => {
  try {
    const fs = require('fs');
    const cpuInfo = fs.readFileSync('/proc/cpuinfo', 'utf8');
    return cpuInfo.includes('Raspberry Pi') || cpuInfo.includes('BCM2708') || cpuInfo.includes('BCM2709') || cpuInfo.includes('BCM2711');
  } catch {
    return false;
  }
};

// Detect if running in headless mode (no display)
const isHeadless = () => {
  return !process.env.DISPLAY || process.env.DISPLAY === '' || process.env.DISPLAY === ':0';
};

const isPi = isRaspberryPi();
const isHeadlessMode = isHeadless();

console.log(`🍓 Raspberry Pi: ${isPi}`);
console.log(`🖥️  Headless mode: ${isHeadlessMode}`);
console.log(`🖥️  DISPLAY: ${process.env.DISPLAY || 'not set'}`);

// Handle GPU process crashes and WebGL issues
app.commandLine.appendSwitch('--disable-gpu-sandbox');
app.commandLine.appendSwitch('--disable-software-rasterizer');
app.commandLine.appendSwitch('--disable-dev-shm-usage');
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--disable-web-security');
app.commandLine.appendSwitch('--allow-running-insecure-content');
app.commandLine.appendSwitch('--disable-gpu-process-crash-limit');
app.commandLine.appendSwitch('--disable-gpu-driver-bug-workarounds');
app.commandLine.appendSwitch('--disable-gpu-vsync');
app.commandLine.appendSwitch('--disable-accelerated-2d-canvas');
app.commandLine.appendSwitch('--disable-accelerated-video-decode');

// Raspberry Pi specific optimizations
if (isPi) {
  console.log('🍓 Raspberry Pi detected - applying optimizations');
  app.commandLine.appendSwitch('--disable-webgl'); // Disable WebGL on Pi for stability
  app.commandLine.appendSwitch('--disable-webgl2');
  app.commandLine.appendSwitch('--disable-accelerated-compositing');
  app.commandLine.appendSwitch('--disable-accelerated-layers');
  app.commandLine.appendSwitch('--disable-accelerated-plugins');
  app.commandLine.appendSwitch('--disable-accelerated-video');
  app.commandLine.appendSwitch('--disable-gpu-memory-buffer-video-frames');
  app.commandLine.appendSwitch('--disable-gpu-rasterization');
  app.commandLine.appendSwitch('--disable-oop-rasterization');
  app.commandLine.appendSwitch('--disable-zero-copy');
  app.commandLine.appendSwitch('--disable-background-timer-throttling');
  app.commandLine.appendSwitch('--disable-renderer-backgrounding');
  app.commandLine.appendSwitch('--disable-backgrounding-occluded-windows');
  app.commandLine.appendSwitch('--disable-features', 'TranslateUI');
  app.commandLine.appendSwitch('--disable-features', 'BlinkGenPropertyTrees');
  app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');
} else {
  // Enable WebGL for desktop systems
  app.commandLine.appendSwitch('--enable-webgl');
  app.commandLine.appendSwitch('--enable-webgl2');
}

// Headless mode support
if (isHeadlessMode) {
  console.log('🖥️  Headless mode detected - applying headless optimizations');
  app.commandLine.appendSwitch('--headless');
  app.commandLine.appendSwitch('--disable-gpu');
  app.commandLine.appendSwitch('--no-sandbox');
  app.commandLine.appendSwitch('--disable-dev-shm-usage');
  app.commandLine.appendSwitch('--disable-web-security');
  app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');
}

const isDev = !app.isPackaged;

function createWindow() {
  // Don't create window in headless mode
  if (isHeadlessMode) {
    console.log('🖥️  Running in headless mode - no window will be created');
    return null;
  }

  const win = new BrowserWindow({
    width: isPi ? 1024 : 1280, // Smaller window for Pi
    height: isPi ? 768 : 800,
    minWidth: isPi ? 800 : 900,
    minHeight: isPi ? 600 : 600,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      // Enable WebGL only on desktop
      webgl: !isPi,
    },
    show: false,
    // Raspberry Pi specific settings
    ...(isPi && {
      fullscreenable: true,
      resizable: true,
      maximizable: false, // Prevent memory issues
    }),
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    if (!isPi) win.webContents.openDevTools(); // Disable dev tools on Pi
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  win.once('ready-to-show', () => win.show());
  
  // Raspberry Pi specific optimizations
  if (isPi) {
    // Reduce memory usage
    win.webContents.setBackgroundThrottling(false);
    
    // Handle low memory situations
    app.on('render-process-gone', (event, webContents, details) => {
      console.log('Render process gone:', details.reason);
      if (details.reason === 'oom') {
        console.log('Out of memory detected - restarting window');
        createWindow();
      }
    });
  }
}

app.whenReady().then(async () => {
  // Start WebSocket server
  try {
    await defaultWebSocketService.start();
    console.log('WebSocket server started successfully');
  } catch (error) {
    console.error('Failed to start WebSocket server:', error);
  }

  // Only create window if not in headless mode
  if (!isHeadlessMode) {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  } else {
    console.log('🖥️  Running in headless mode - WebSocket server is available');
    console.log('🌐 WebSocket server running on port 8080');
  }
});

app.on('window-all-closed', () => {
  // Stop WebSocket server
  defaultWebSocketService.stop();
  
  if (process.platform !== 'darwin') app.quit();
}); 

// Add IPC handler for update-from-git
ipcMain.handle('update-from-git', async () => {
  return new Promise((resolve, reject) => {
    // Run update commands sequentially
    exec('git pull origin main', { cwd: process.cwd() }, (err, stdout, stderr) => {
      if (err) return reject(`git pull failed: ${stderr}`);
      exec('npm install', { cwd: process.cwd() }, (err2, stdout2, stderr2) => {
        if (err2) return reject(`npm install failed: ${stderr2}`);
        exec('npm run build', { cwd: process.cwd() }, (err3, stdout3, stderr3) => {
          if (err3) return reject(`npm run build failed: ${stderr3}`);
          // All done, restart the app
          electronApp.relaunch();
          electronApp.exit(0);
          resolve('Update and restart successful');
        });
      });
    });
  });
}); 